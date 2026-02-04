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
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        unlockedByCompany: true,
        unlockedByTransporter: true,
        acceptedAt: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    if (role !== "transporter" && role !== "company") {
      return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
    }

    const nextCompanyUnlocked = request.unlockedByCompany || role === "company";
    const nextTransporterUnlocked = request.unlockedByTransporter || role === "transporter";
    const shouldAccept = nextCompanyUnlocked && nextTransporterUnlocked;

    await prisma.request.update({
      where: { id: requestId },
      data: {
        unlockedByCompany: nextCompanyUnlocked,
        unlockedByTransporter: nextTransporterUnlocked,
        acceptedAt: shouldAccept && !request.acceptedAt ? new Date() : undefined,
        status: shouldAccept ? "ACCEPTED" : undefined,
      },
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
