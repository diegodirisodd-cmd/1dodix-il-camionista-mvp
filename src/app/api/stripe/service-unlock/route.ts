import { NextResponse } from "next/server";

import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SERVICE_CATEGORY_LABELS,
  getServiceUnlockTotalCents,
  type ServiceCategory,
} from "@/lib/service-categories";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY mancante");
      return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Solo i fornitori possono sbloccare il contatto di una richiesta" },
        { status: 403 },
      );
    }

    const { requestId } = (await req.json()) as { requestId?: number };

    if (!Number.isFinite(requestId)) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Completa prima il profilo fornitore" },
        { status: 400 },
      );
    }

    const existingUnlock = await prisma.serviceContactUnlock.findUnique({
      where: {
        requestId_supplierId: { requestId: serviceRequest.id, supplierId: supplierProfile.id },
      },
    });

    if (existingUnlock) {
      return NextResponse.json(
        { error: "Hai già sbloccato il contatto per questa richiesta" },
        { status: 400 },
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    // Importo fisso (non una percentuale come per le richieste di trasporto):
    // il prezzo di listino è IVA esclusa, in checkout si addebita IVA inclusa.
    const unitAmountCents = getServiceUnlockTotalCents();

    if (!Number.isFinite(unitAmountCents) || unitAmountCents <= 0) {
      return NextResponse.json(
        { error: "Importo di sblocco non valido." },
        { status: 400 },
      );
    }

    const categoriaLabel =
      SERVICE_CATEGORY_LABELS[serviceRequest.categoria as ServiceCategory] ??
      serviceRequest.categoria;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      metadata: {
        kind: "SERVICE_CONTACT_UNLOCK",
        serviceRequestId: String(serviceRequest.id),
        supplierProfileId: String(supplierProfile.id),
        userId: String(user.id),
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Sblocco contatto Borsa Servizi",
              description: `Richiesta #${serviceRequest.id} · ${categoriaLabel} · ${serviceRequest.provincia}`,
            },
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/services/${serviceRequest.id}?unlock=success`,
      cancel_url: `${baseUrl}/dashboard/services/${serviceRequest.id}?unlock=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Stripe error";
    console.error("[STRIPE] service-unlock ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
