import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";
import { calculateCommission } from "@/lib/commission";
import { selectWithExistingPayment, selectWithFreeUnlock } from "@/lib/load-flow";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS, REQUEST_STATUS, effectivePriceCents } from "@/lib/request-flow";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/**
 * L'azienda sceglie un candidato. Se ha gia' pagato la commissione per questo
 * carico (scelta precedente non confermata) l'assegnazione e' immediata,
 * altrimenti parte il checkout Stripe e l'assegnazione avviene a pagamento
 * riuscito (webhook o pagina di conferma).
 */
export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    if (user.role !== "COMPANY") return NextResponse.json({ error: "Solo l'azienda sceglie." }, { status: 403 });

    const applicationId = Number(params.id);
    if (!Number.isInteger(applicationId)) return NextResponse.json({ error: "Candidatura non valida" }, { status: 400 });

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        status: true,
        priceCents: true,
        request: { select: { id: true, companyId: true, status: true, price: true } },
      },
    });
    if (!app || app.request.companyId !== user.id) {
      return NextResponse.json({ error: "Candidatura non trovata" }, { status: 404 });
    }
    if (app.request.status !== REQUEST_STATUS.OPEN) {
      return NextResponse.json({ error: "Hai già scelto un trasportatore per questo carico." }, { status: 409 });
    }
    if (app.status !== APPLICATION_STATUS.PENDING) {
      return NextResponse.json({ error: "Questa candidatura non è più disponibile." }, { status: 409 });
    }

    const paid = await prisma.requestUnlock.findUnique({
      where: { requestId_userId: { requestId: app.request.id, userId: user.id } },
      select: { id: true },
    });
    if (paid) {
      const ok = await selectWithExistingPayment(app.id);
      return ok
        ? NextResponse.json({ selected: true })
        : NextResponse.json({ error: "Non è stato possibile assegnare il carico." }, { status: 409 });
    }

    // Primo sblocco gratuito (per P.IVA): niente Stripe.
    const free = await selectWithFreeUnlock(user.id, app.id);
    if (free === "applied") return NextResponse.json({ selected: true, free: true });
    if (free === "unavailable") {
      return NextResponse.json({ error: "Non è stato possibile assegnare il carico. Riprova." }, { status: 409 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Pagamenti non configurati." }, { status: 500 });
    }

    const priceCents = effectivePriceCents(app.request.price, app.priceCents);
    const { total } = calculateCommission(priceCents);
    if (total < 50) return NextResponse.json({ error: "Importo della commissione non valido." }, { status: 400 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const detailUrl = `${baseUrl}/dashboard/company/requests/${app.request.id}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      // Il checkout scade presto: un pagamento vecchio non deve arrivare a
      // situazione cambiata (in quel caso viene comunque rimborsato).
      expires_at: Math.floor(Date.now() / 1000) + 35 * 60,
      metadata: {
        kind: "SELECT_APPLICATION",
        priceCents: String(priceCents),
        applicationId: String(app.id),
        requestId: String(app.request.id),
        userId: String(user.id),
        role: "COMPANY",
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Assegnazione carico #${app.request.id}: commissione DodiX 2% + IVA` },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/stripe/success?session_id={CHECKOUT_SESSION_ID}&requestId=${app.request.id}&role=company`,
      cancel_url: detailUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[select application]", error);
    return NextResponse.json({ error: "Impossibile avviare il pagamento." }, { status: 500 });
  }
}
