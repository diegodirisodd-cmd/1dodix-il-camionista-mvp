import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

export async function POST() {
  if (!stripe || !stripeSecret || !priceId) {
    return NextResponse.json(
      { error: "Stripe non è configurato correttamente." },
      { status: 500 },
    );
  }

  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  if (user.subscriptionActive) {
    return NextResponse.json({ url: `${appUrl}/dashboard?checkout=active` });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard/billing`,
      metadata: {
        userId: String(user.id),
        role: user.role,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "URL checkout non disponibile." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Errore Stripe Checkout", error);
    return NextResponse.json({ error: "Impossibile avviare il checkout." }, { status: 500 });
  }
}
