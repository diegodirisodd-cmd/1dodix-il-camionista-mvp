import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
    }

    const { session_id } = (await req.json()) as { session_id?: string };

    if (!session_id) {
      return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Trust only Stripe metadata (set by us during checkout creation), never client-provided values.
    const requestIdRaw = session.metadata?.requestId;
    const userIdRaw = session.metadata?.userId;
    const roleRaw = session.metadata?.role;

    const requestId = Number(requestIdRaw);
    const userId = Number(userIdRaw);

    if (!Number.isFinite(requestId) || !Number.isFinite(userId) || !roleRaw) {
      return NextResponse.json({ error: "Metadata pagamento incompleti" }, { status: 400 });
    }

    const normalizedRole = roleRaw.toUpperCase();
    if (normalizedRole !== "COMPANY" && normalizedRole !== "TRANSPORTER") {
      return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
    }

    const requestRecord = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        unlockedByCompany: true,
        unlockedByTransporter: true,
        transporterId: true,
      },
    });

    if (!requestRecord) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    const stripePaymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
    const amountCents = session.amount_total ?? null;

    await prisma.requestUnlock.upsert({
      where: {
        requestId_userId: { requestId, userId },
      },
      create: {
        requestId,
        userId,
        userRole: normalizedRole,
        amountCents,
        stripeSessionId: session.id,
        stripePaymentIntentId,
      },
      update: {
        userRole: normalizedRole,
        amountCents,
        stripeSessionId: session.id,
        stripePaymentIntentId,
        paidAt: new Date(),
      },
    });

    const nextCompanyUnlocked = requestRecord.unlockedByCompany || normalizedRole === "COMPANY";
    const nextTransporterUnlocked = requestRecord.unlockedByTransporter || normalizedRole === "TRANSPORTER";
    const nextContactsUnlocked = nextCompanyUnlocked && nextTransporterUnlocked;

    const nextStatus =
      nextCompanyUnlocked && nextTransporterUnlocked
        ? "COMPLETED"
        : nextTransporterUnlocked
          ? "TRANSPORTER_PAID"
          : nextCompanyUnlocked
            ? "COMPANY_PAID"
            : "OPEN";

    const updateData: Record<string, unknown> = {
      unlockedByCompany: nextCompanyUnlocked,
      unlockedByTransporter: nextTransporterUnlocked,
      contactsUnlocked: nextContactsUnlocked,
      status: nextStatus,
    };

    if (normalizedRole === "TRANSPORTER" && !requestRecord.transporterId) {
      updateData.transporterId = userId;
      updateData.acceptedAt = new Date();
    }

    await prisma.request.update({
      where: { id: requestId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Stripe error";
    console.error("STRIPE CONFIRM ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
