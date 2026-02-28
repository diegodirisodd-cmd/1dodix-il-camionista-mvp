import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  const body = await request.text(); // MUST be raw body

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  console.log("[WEBHOOK] Stripe event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      console.log("[WEBHOOK] Payment not completed, skipping");
      return NextResponse.json({ received: true });
    }

    const requestId = Number(session.metadata?.requestId);
    const role = session.metadata?.role;

    console.log("[WEBHOOK] Payment completed:", { requestId, role });

    if (!Number.isFinite(requestId) || requestId <= 0) {
      console.error("[WEBHOOK] Invalid requestId:", session.metadata?.requestId);
      return NextResponse.json({ received: true });
    }

    if (!role || (role !== "company" && role !== "transporter")) {
      console.error("[WEBHOOK] Invalid role:", role);
      return NextResponse.json({ received: true });
    }

    try {
      if (role === "company") {
        await prisma.request.update({
          where: { id: requestId },
          data: { unlockedByCompany: true },
        });
      } else {
        await prisma.request.update({
          where: { id: requestId },
          data: { unlockedByTransporter: true },
        });
      }

      const result = await prisma.request.updateMany({
        where: {
          id: requestId,
          unlockedByCompany: true,
          unlockedByTransporter: true,
        },
        data: {
          contactsUnlocked: true,
          status: "COMPLETED",
        },
      });

      if (result.count > 0) {
        console.log("[WEBHOOK] Both paid! Contacts unlocked for request " + requestId);
      } else {
        const partialStatus = role === "company" ? "COMPANY_PAID" : "TRANSPORTER_PAID";
        await prisma.request.update({
          where: { id: requestId },
          data: { status: partialStatus },
        });
        console.log("[WEBHOOK] Partial unlock: " + partialStatus + " for request " + requestId);
      }
    } catch (dbError) {
      console.error("[WEBHOOK] Database error:", dbError);
      return new NextResponse("Database error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
