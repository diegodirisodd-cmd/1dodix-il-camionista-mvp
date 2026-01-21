import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  try {
    console.log("🚀 [STRIPE] unlock API HIT");

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY mancante");
      return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    console.log("🔑 Stripe inizializzato");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Sblocco contatti",
            },
            unit_amount: 70, // 0,70 €
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/stripe/success",
      cancel_url: "http://localhost:3000/stripe/cancel",
    });

    console.log("✅ Session creata:", session.id);
    console.log("➡️ Redirect URL:", session.url);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ STRIPE ERROR:", error);
    return NextResponse.json(
      { error: error.message ?? "Stripe error" },
      { status: 500 }
    );
  }
}
