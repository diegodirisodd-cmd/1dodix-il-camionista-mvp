import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripe || !stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe non configurato." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Firma mancante" }, { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Errore webhook Stripe", error);
    return new NextResponse(`Webhook Error: ${(error as Error).message}`, { status: 400 });
  }

  console.log("[WEBHOOK] evento ricevuto", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const requestId = Number(session.metadata?.requestId);
    const role = session.metadata?.role;

    if (!requestId || !role) {
      console.error("Missing metadata in Stripe session");
      return NextResponse.json({ received: true });
    }

    const existing = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      console.error("Request not found");
      return NextResponse.json({ received: true });
    }

    if (role === "transporter") {
      await prisma.request.update({
        where: { id: requestId },
        data: {
          unlockedByTransporter: true,
        },
      });
    }

    if (role === "company") {
      await prisma.request.update({
        where: { id: requestId },
        data: {
          unlockedByCompany: true,
        },
      });
    }

    const updated = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (updated?.unlockedByTransporter && updated?.unlockedByCompany) {
      await prisma.request.update({
        where: { id: requestId },
        data: {
          contactsUnlocked: true,
        },
      });
    }

    console.log("[WEBHOOK] stato pagamento aggiornato");
  }

  return NextResponse.json({ received: true });
}
