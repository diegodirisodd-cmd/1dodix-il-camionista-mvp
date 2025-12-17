import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY non configurata");
  }

  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (user.subscriptionActive) {
    return NextResponse.json({ url: new URL("/dashboard", request.url).toString() });
  }

  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID non configurato" }, { status: 500 });
  }

  const stripe = getStripeClient();
  const origin = new URL(request.url).origin;

  let customerId = user.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: String(user.id) },
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard`,
    cancel_url: `${origin}/paywall`,
    metadata: { userId: String(user.id) },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Impossibile creare la sessione" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
