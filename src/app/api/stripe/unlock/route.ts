import { NextResponse } from "next/server";

import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";
import { calculateCommission } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import { REQUEST_STATUS } from "@/lib/request-flow";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/**
 * Avvia il checkout Stripe con cui il trasportatore scelto conferma il carico
 * e sblocca i contatti dell'azienda. L'importo e' sempre
 * calcolato qui dal prezzo del carico salvato nel database: il client manda
 * solo l'id della richiesta, mai una cifra.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY mancante");
      return NextResponse.json({ error: "Pagamenti non configurati." }, { status: 500 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as { requestId?: unknown } | null;
    const requestId = Number(body?.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, price: true, agreedPrice: true, transporterId: true, status: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    // Con il nuovo flusso questa rotta serve solo al trasportatore scelto
    // dall'azienda per confermare: l'azienda paga quando sceglie
    // (/api/applications/[id]/select).
    if (user.role !== "TRANSPORTER") {
      return NextResponse.json(
        { error: "L'azienda paga la commissione quando sceglie il trasportatore." },
        { status: 409 },
      );
    }

    if (request.status !== REQUEST_STATUS.ASSIGNED || request.transporterId !== user.id) {
      return NextResponse.json({ error: "Questo carico non è assegnato a te." }, { status: 409 });
    }

    const already = await prisma.requestUnlock.findUnique({
      where: { requestId_userId: { requestId, userId: user.id } },
      select: { id: true },
    });
    if (already) {
      return NextResponse.json({ error: "Hai già confermato questo carico." }, { status: 409 });
    }

    const { total } = calculateCommission(request.agreedPrice ?? request.price);

    // Stripe rifiuta addebiti in euro sotto i 50 centesimi.
    if (!Number.isFinite(total) || total < 50) {
      return NextResponse.json({ error: "Importo di sblocco non valido." }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const rolePath = "transporter";
    const detailUrl = `${baseUrl}/dashboard/${rolePath}/requests/${requestId}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: {
        requestId: String(requestId),
        role: user.role,
        userId: String(user.id),
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Conferma carico #${requestId}: commissione DodiX 2% + IVA` },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/stripe/success?session_id={CHECKOUT_SESSION_ID}&requestId=${requestId}&role=${rolePath}`,
      cancel_url: detailUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("[STRIPE] unlock error", error);
    return NextResponse.json({ error: "Impossibile avviare il pagamento." }, { status: 500 });
  }
}
