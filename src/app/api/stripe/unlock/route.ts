import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";
import { calculateCommission } from "@/lib/commission";
import { prisma } from "@/lib/prisma";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

function detailPathForRole(role: string, requestId: number) {
  if (role === "COMPANY") {
    return `${appUrl}/dashboard/company/requests/${requestId}`;
  }
  if (role === "TRANSPORTER") {
    return `${appUrl}/dashboard/transporter/requests/${requestId}`;
  }
  return `${appUrl}/dashboard`;
}

export async function POST(request: Request) {
  if (!stripe || !stripeSecret) {
    return NextResponse.json(
      { error: "Stripe non è configurato correttamente." },
      { status: 500 },
    );
  }

  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const body = (await request.json()) as { requestId?: number; role?: string };
  const requestId = Number(body.requestId);
  const role = body.role;

  if (!Number.isFinite(requestId) || (role !== "COMPANY" && role !== "TRANSPORTER")) {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  if (user.role !== role) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
  }

  const requestRecord = await prisma.request.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      price: true,
      unlockedByCompany: true,
      unlockedByTransporter: true,
    },
  });

  if (!requestRecord) {
    return NextResponse.json({ error: "Richiesta non trovata." }, { status: 404 });
  }

  if (role === "COMPANY" && requestRecord.unlockedByCompany) {
    return NextResponse.json({ url: detailPathForRole(role, requestId) });
  }

  if (role === "TRANSPORTER" && requestRecord.unlockedByTransporter) {
    return NextResponse.json({ url: detailPathForRole(role, requestId) });
  }

  const breakdown = calculateCommission(requestRecord.price);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Sblocco contatti trasporto",
            },
            unit_amount: breakdown.total,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/payment/success?requestId=${requestId}&role=${role}`,
      cancel_url: detailPathForRole(role, requestId),
      metadata: {
        requestId: String(requestId),
        role,
        userId: String(user.id),
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "URL checkout non disponibile." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Errore Stripe unlock checkout", error);
    return NextResponse.json({ error: "Impossibile avviare il checkout." }, { status: 500 });
  }
}
