import { NextResponse } from "next/server";

import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";
import { calculateCommission } from "@/lib/commission";
import { prisma } from "@/lib/prisma";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/**
 * Avvia il checkout Stripe per lo sblocco contatti di un carico.
 *
 * Unico punto di ingresso per aziende e trasportatori. L'importo e' sempre
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

    if (user.role !== "COMPANY" && user.role !== "TRANSPORTER") {
      return NextResponse.json({ error: "Ruolo non abilitato allo sblocco." }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as { requestId?: unknown } | null;
    const requestId = Number(body?.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, price: true, companyId: true, transporterId: true, status: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    if (request.status === "CANCELLED") {
      return NextResponse.json({ error: "Il carico è stato annullato." }, { status: 409 });
    }

    const existing = await prisma.requestUnlock.findMany({
      where: { requestId },
      select: { userId: true, userRole: true },
    });

    if (existing.some((u) => u.userId === user.id)) {
      return NextResponse.json({ error: "Hai già sbloccato questo carico." }, { status: 409 });
    }

    if (user.role === "COMPANY") {
      // L'azienda sblocca solo i propri carichi e solo dopo che un
      // trasportatore ha pagato (altrimenti non ci sarebbe nessun contatto).
      if (request.companyId !== user.id) {
        return NextResponse.json({ error: "Non è un tuo carico." }, { status: 403 });
      }
      if (!existing.some((u) => u.userRole === "TRANSPORTER")) {
        return NextResponse.json(
          { error: "Nessun trasportatore ha ancora preso questo carico." },
          { status: 409 },
        );
      }
    } else {
      // Un trasportatore non puo' pagare un carico gia' preso da un altro.
      if (request.transporterId !== null && request.transporterId !== user.id) {
        return NextResponse.json({ error: "Carico già assegnato." }, { status: 409 });
      }
      if (existing.some((u) => u.userRole === "TRANSPORTER")) {
        return NextResponse.json({ error: "Carico già assegnato." }, { status: 409 });
      }
    }

    const { total } = calculateCommission(request.price);

    // Stripe rifiuta addebiti in euro sotto i 50 centesimi.
    if (!Number.isFinite(total) || total < 50) {
      return NextResponse.json({ error: "Importo di sblocco non valido." }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const rolePath = user.role === "COMPANY" ? "company" : "transporter";
    const detailUrl = `${baseUrl}/dashboard/${rolePath}/requests/${requestId}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      metadata: {
        requestId: String(requestId),
        role: user.role,
        userId: String(user.id),
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Sblocco contatti carico #${requestId} (2% + IVA)` },
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
