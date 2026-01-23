import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
    }

    const { session_id, requestId, role } = (await req.json()) as {
      session_id?: string;
      requestId?: number;
      role?: string;
    };

    if (!session_id || !Number.isFinite(requestId) || !role) {
      return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const updateData =
      role === "transporter"
        ? { unlockedByTransporter: true }
        : role === "company"
          ? { unlockedByCompany: true }
          : null;

    if (!updateData) {
      return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
    }

    await prisma.request.update({
      where: { id: requestId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ STRIPE CONFIRM ERROR:", error);
    return NextResponse.json(
      { error: error.message ?? "Stripe error" },
      { status: 500 }
    );
  }
}
