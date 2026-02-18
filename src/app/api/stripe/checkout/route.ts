import { NextResponse } from "next/server";
import Stripe from "stripe";

type CheckoutPayload = {
  requestId?: number;
  userRole?: "company" | "transporter";
  amount?: number;
};

export async function POST(request: Request) {
  try {
    console.log("Stripe unlock called");

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

    const body = (await request.json()) as CheckoutPayload;
    const requestId = Number(body.requestId);
    const userRole = body.userRole;
    const amount = Number(body.amount);

    console.log("Incoming data:", { requestId, userRole, amount });

    if (!requestId || !amount) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      console.error("Missing base URL");
      return NextResponse.json(
        { error: "Missing base URL" },
        { status: 500 },
      );
    }

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
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        requestId: String(requestId),
        role: userRole,
      },
      success_url: `${baseUrl}/dashboard/stripe/success?requestId=${requestId}&role=${userRole}`,
      cancel_url: `${baseUrl}/dashboard/company/requests`,
    });

    if (!session.url) {
      throw new Error("Stripe session missing URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe unlock error:", error);
    return NextResponse.json(
      { error: "Stripe internal error" },
      { status: 500 },
    );
  }
}
