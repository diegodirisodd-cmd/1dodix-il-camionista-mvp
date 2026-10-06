import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";
import { applyLoadCheckout } from "@/lib/load-flow";

/**
 * Chiamata dalla pagina di ritorno da Stripe: applica subito il pagamento
 * senza aspettare il webhook. Si fida solo dei metadata scritti dal server
 * alla creazione del checkout; l'operazione e' idempotente.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Pagamenti non configurati." }, { status: 500 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { session_id } = ((await req.json().catch(() => ({}))) ?? {}) as { session_id?: string };
    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (Number(session.metadata?.userId) !== user.id) {
      return NextResponse.json({ error: "Pagamento di un altro utente." }, { status: 403 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Pagamento non completato." }, { status: 400 });
    }

    const result = await applyLoadCheckout(session);
    if (!result.ok) {
      return NextResponse.json({ error: "Pagamento non applicabile: " + (result.reason ?? "") }, { status: 400 });
    }

    return NextResponse.json({ success: true, applied: result.applied, refunded: result.refunded ?? false, message: result.reason ?? null });
  } catch (error: unknown) {
    console.error("STRIPE CONFIRM ERROR:", error);
    return NextResponse.json({ error: "Errore nella conferma del pagamento." }, { status: 500 });
  }
}
