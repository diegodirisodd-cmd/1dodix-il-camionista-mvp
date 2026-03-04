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
    const requestId = session.metadata?.requestId;
    const role = session.metadata?.role;
    const userId = session.metadata?.userId;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    console.log("[WEBHOOK] pagamento confermato");

    const parsedRequestId = Number(requestId);
    if (!Number.isFinite(parsedRequestId) || !role) {
      return NextResponse.json({ received: true });
    }

    const normalizedRole = role.toUpperCase();
    if (normalizedRole !== "COMPANY" && normalizedRole !== "TRANSPORTER") {
      return NextResponse.json({ received: true });
    }

    const request = await prisma.request.findUnique({
      where: { id: parsedRequestId },
      select: {
        unlockedByCompany: true,
        unlockedByTransporter: true,
        transporterId: true,
      },
    });

    if (!request) {
      return NextResponse.json({ received: true });
    }

    const nextCompanyUnlocked =
      request.unlockedByCompany || normalizedRole === "COMPANY";
    const nextTransporterUnlocked =
      request.unlockedByTransporter || normalizedRole === "TRANSPORTER";
    const nextContactsUnlocked = nextCompanyUnlocked && nextTransporterUnlocked;

    const nextStatus =
      nextCompanyUnlocked && nextTransporterUnlocked
        ? "COMPLETED"
        : nextTransporterUnlocked
          ? "TRANSPORTER_PAID"
          : nextCompanyUnlocked
            ? "COMPANY_PAID"
            : "OPEN";

    // Build update data
    const updateData: Record<string, unknown> = {
      unlockedByCompany: nextCompanyUnlocked,
      unlockedByTransporter: nextTransporterUnlocked,
      contactsUnlocked: nextContactsUnlocked,
      status: nextStatus,
    };

    // If transporter paid and no transporter assigned yet, assign them
    if (normalizedRole === "TRANSPORTER" && userId && !request.transporterId) {
      const parsedUserId = Number(userId);
      if (Number.isFinite(parsedUserId)) {
        updateData.transporterId = parsedUserId;
        updateData.acceptedAt = new Date();
      }
    }

    await prisma.request.update({
      where: { id: parsedRequestId },
      data: updateData,
    });

    console.log("[WEBHOOK] stato pagamento aggiornato", { requestId: parsedRequestId, role: normalizedRole, userId });
  }

  return NextResponse.json({ received: true });
}
