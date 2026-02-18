import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

type CheckoutPayload = {
  requestId?: number;
  userRole?: "company" | "transporter";
  amount?: number;
};

export async function POST(request: Request) {
  try {
    if (!stripeSecret) {
      return NextResponse.json(
        { error: "Stripe non è configurato correttamente." },
        { status: 500 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SITE_URL non configurata." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as CheckoutPayload;
    const requestId = Number(body.requestId);
    const userRole = body.userRole;
    const amount = Number(body?.amount);

    if (!Number.isFinite(requestId)) {
      return NextResponse.json({ error: "Parametri non validi." }, { status: 400 });
    }

    if (userRole !== "company") {
      return NextResponse.json({ error: "Ruolo non valido." }, { status: 400 });
    }

    if (!amount || !Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "Importo non valido." }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: {
        requestId: String(requestId),
        role: "company",
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Sblocco contatti",
              description: "Commissione di servizio Dodix",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/stripe/success?requestId=${requestId}&role=company`,
      cancel_url: `${baseUrl}/dashboard/stripe/cancel?requestId=${requestId}`,
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
