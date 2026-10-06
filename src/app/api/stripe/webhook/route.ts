import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { applyLoadCheckout } from "@/lib/load-flow";
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
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    console.log("[WEBHOOK] pagamento confermato");

    // Borsa Servizi: sblocco contatto del trasportatore per un fornitore.
    // Percorso separato da quello dei trasporti (RequestUnlock), riconosciuto
    // dal metadata "kind" impostato in api/stripe/service-unlock.
    if (session.metadata?.kind === "SERVICE_CONTACT_UNLOCK") {
      await handleServiceContactUnlock(session);
      return NextResponse.json({ received: true });
    }

    const result = await applyLoadCheckout(session);
    if (!result.ok) {
      console.error("[WEBHOOK] pagamento carico non applicato", { sessionId: session.id, reason: result.reason });
      // Un rimborso dovuto ma non riuscito: rispondere con errore fa
      // ritentare il webhook a Stripe (il rimborso e' idempotente).
      if (result.refunded === false) {
        return NextResponse.json({ error: "rimborso in sospeso" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

async function handleServiceContactUnlock(session: Stripe.Checkout.Session) {
  const serviceRequestId = Number(session.metadata?.serviceRequestId);
  const supplierProfileId = Number(session.metadata?.supplierProfileId);

  if (!Number.isFinite(serviceRequestId) || !Number.isFinite(supplierProfileId)) {
    console.error("[WEBHOOK] metadata sblocco servizio incompleti", session.metadata);
    return;
  }

  const stripePaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const amountCents = session.amount_total ?? null;

  if (amountCents === null || amountCents <= 0) {
    console.error("[WEBHOOK] importo sblocco servizio non valido", {
      sessionId: session.id,
      amountCents,
    });
    return;
  }

  try {
    await prisma.serviceContactUnlock.upsert({
      where: {
        requestId_supplierId: {
          requestId: serviceRequestId,
          supplierId: supplierProfileId,
        },
      },
      create: {
        requestId: serviceRequestId,
        supplierId: supplierProfileId,
        amountCents,
        stripeSessionId: session.id,
        stripePaymentIntentId,
      },
      update: {
        amountCents,
        stripeSessionId: session.id,
        stripePaymentIntentId,
        paidAt: new Date(),
      },
    });

    console.log("[WEBHOOK] sblocco contatto Borsa Servizi registrato", {
      serviceRequestId,
      supplierProfileId,
    });
  } catch (error) {
    console.error("[WEBHOOK] sblocco contatto Borsa Servizi fallito", error);
  }
}
