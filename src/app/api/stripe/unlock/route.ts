import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("🚀 [STRIPE] unlock API HIT");

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY mancante");
      return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
    }

    const { requestId } = (await req.json()) as { requestId?: number };

    if (!Number.isFinite(requestId)) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request || typeof request.price !== "number") {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    console.log("🔑 Stripe inizializzato");

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    const role = user.role.toLowerCase();

    const priceEuro = request.price / 100;
    const commission = priceEuro * 0.02;
    const iva = commission * 0.22;
    const totaleEuro = commission + iva;
    const unitAmountCents = Math.round(totaleEuro * 100);

    console.log("REQUEST PRICE:", request.price);
    console.log("COMMISSION:", commission);
    console.log("IVA:", iva);
    console.log("TOTALE EURO:", totaleEuro);
    console.log("UNIT AMOUNT CENTS:", unitAmountCents);

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
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      success_url:
        `http://localhost:3000/stripe/success?session_id={CHECKOUT_SESSION_ID}` +
        `&requestId=${requestId}&role=${role}`,
      cancel_url: `http://localhost:3000/stripe/cancel?requestId=${requestId}&role=${role}`,
    });

    console.log("✅ Session creata:", session.id);
    console.log("➡️ Redirect URL:", session.url);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ STRIPE ERROR:", error);
    return NextResponse.json(
      { error: error.message ?? "Stripe error" },
      { status: 500 }
    );
  }
}
