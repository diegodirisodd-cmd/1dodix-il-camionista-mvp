import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    console.log("🚀 Stripe unlock API HIT");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });

    const amountCents = 70; // 0,70 € test reale

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
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/stripe/success",
      cancel_url: "http://localhost:3000/stripe/cancel",
    });

    console.log("✅ Stripe session creata:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("❌ STRIPE ERROR:", error);
    return NextResponse.json(
      { error: "Errore Stripe" },
      { status: 500 }
    );
  }
}
