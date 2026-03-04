import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";

type CheckoutPayload = {
  requestId?: number;
  userRole?: "company" | "transporter";
  amount?: number;
};

export async function POST(request: Request) {
  try {
    console.log("Stripe unlock called");

    const sessionUser = await getSessionUser();

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "Non autorizzato." },
        { status: 401 },
      );
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
      console.error("Missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    });

    const body = (await request.json().catch(() => null)) as CheckoutPayload | null;

    if (!body || body.requestId === undefined || body.amount === undefined || !body.userRole) {
      return NextResponse.json(
        { error: "Parametri non validi." },
        { status: 400 },
      );
    }

    const requestId = Number(body.requestId);
    const userRole = body.userRole;
    const amount = Number(body.amount);

    console.log("Incoming data:", { requestId, userRole, amount });

    if (!requestId || !amount || !userRole) {
      return NextResponse.json(
        { error: "Parametri non validi." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(requestId) || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Parametri non validi." },
        { status: 400 },
      );
    }

    if (userRole !== "company" && userRole !== "transporter") {
      return NextResponse.json(
        { error: "Parametri non validi." },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Sblocco contatti",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        requestId: String(requestId),
        role: String(userRole),
        userId: String(sessionUser.id),
      },
      success_url: `${baseUrl}/dashboard/stripe/success?requestId=${requestId}&role=${userRole}`,
      cancel_url: `${baseUrl}/dashboard/company/requests`,
    };

    const session = await stripe.checkout.sessions.create(params);

    console.log("Stripe session created:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Errore interno del server." },
      { status: 500 },
    );
  }
}
