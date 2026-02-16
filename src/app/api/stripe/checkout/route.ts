import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

type CheckoutPayload = {
  requestId?: number;
  userRole?: "company" | "transporter";
  amount?: number;
};

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function POST(request: Request) {
  if (!stripe || !stripeSecret) {
    return NextResponse.json(
      { error: "Stripe non è configurato correttamente." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as CheckoutPayload;
  const requestId = Number(body.requestId);
  const userRole = body.userRole;
  const amount = Number(body?.amount);

  if (!Number.isFinite(requestId) || (userRole !== "company" && userRole !== "transporter")) {
    return NextResponse.json({ error: "Parametri non validi." }, { status: 400 });
  }

  if (!amount || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "Importo non valido." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: {
        requestId: String(requestId),
        role: userRole.toUpperCase(),
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
      success_url: `${baseUrl}/dashboard/stripe/success?requestId=${requestId}&role=${userRole}`,
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
