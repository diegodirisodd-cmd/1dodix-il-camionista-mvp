import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { OFFER_COOLDOWN_MS, OFFER_LIMITS, canSendOffers } from "@/lib/offers";
import { prisma } from "@/lib/prisma";

function cleanLink(raw: unknown): string | null | "invalid" {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "invalid";
  } catch {
    return "invalid";
  }
}

/** Invia un'offerta a tutti i trasportatori: solo account autorizzati. */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    if (user.role !== "SUPPLIER" || !canSendOffers(user.email)) {
      return NextResponse.json({ error: "Non puoi inviare offerte." }, { status: 403 });
    }

    const b = (await req.json().catch(() => null)) as { title?: unknown; body?: unknown; linkUrl?: unknown } | null;
    const title = String(b?.title ?? "").replace(/\s+/g, " ").trim();
    const body = String(b?.body ?? "").replace(/\r/g, "").trim();
    const link = cleanLink(b?.linkUrl);
    if (!title || !body) return NextResponse.json({ error: "Titolo e testo sono obbligatori." }, { status: 400 });
    if (title.length > OFFER_LIMITS.title || body.length > OFFER_LIMITS.body) {
      return NextResponse.json({ error: "Testo troppo lungo." }, { status: 400 });
    }
    if (link === "invalid") return NextResponse.json({ error: "Link non valido." }, { status: 400 });

    const last = await prisma.offer.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } });
    if (last && Date.now() - last.createdAt.getTime() < OFFER_COOLDOWN_MS) {
      return NextResponse.json({ error: "Hai appena inviato un'offerta. Riprova tra qualche minuto." }, { status: 429 });
    }

    // L'inserimento fa partire il trigger che manda i WhatsApp.
    const offer = await prisma.offer.create({
      data: { senderId: user.id, title, body, linkUrl: link },
      select: { id: true },
    });
    return NextResponse.json({ sent: true, id: offer.id });
  } catch (error) {
    console.error("[offers]", error);
    return NextResponse.json({ error: "Impossibile inviare l'offerta." }, { status: 500 });
  }
}
