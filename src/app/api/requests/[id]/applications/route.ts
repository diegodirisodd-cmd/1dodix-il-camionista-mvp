import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { MAX_PRICE_EUR, MIN_PRICE_EUR, parseEuroToCents, priceOutOfRange } from "@/lib/catalog";
import { displayName } from "@/lib/load-flow";
import { notifyNewApplication } from "@/lib/load-notifications";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS, canApply, maskContacts } from "@/lib/request-flow";

/** Il trasportatore si candida (gratis) o aggiorna la propria candidatura. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (user.role !== "TRANSPORTER") {
    return NextResponse.json({ error: "Solo i trasportatori possono candidarsi." }, { status: 403 });
  }

  const requestId = Number(params.id);
  if (!Number.isInteger(requestId)) return NextResponse.json({ error: "Carico non valido" }, { status: 400 });

  const load = await prisma.request.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      status: true,
      pickupDate: true,
      pickup: true,
      delivery: true,
      company: { select: { email: true, firstName: true, companyName: true } },
    },
  });
  if (!load) return NextResponse.json({ error: "Carico non trovato" }, { status: 404 });
  if (!canApply(load)) {
    return NextResponse.json({ error: "Questo carico non accetta più candidature." }, { status: 409 });
  }

  const body = (await req.json().catch(() => null)) as { price?: unknown; message?: unknown } | null;
  const hasPrice = body?.price !== null && body?.price !== undefined && body?.price !== "";
  const priceCents = hasPrice ? parseEuroToCents(body?.price) : null;
  if (hasPrice && (priceCents === null || priceOutOfRange(priceCents))) {
    return NextResponse.json(
      { error: `Prezzo non valido: indica un importo fra ${MIN_PRICE_EUR} e ${MAX_PRICE_EUR.toLocaleString("it-IT")} €.` },
      { status: 400 },
    );
  }
  const rawMessage = typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";
  // Il messaggio di candidatura segue le stesse regole della chat.
  const message = rawMessage ? maskContacts(rawMessage).text : null;

  const existing = await prisma.application.findUnique({
    where: { requestId_transporterId: { requestId, transporterId: user.id } },
    select: { id: true, status: true },
  });

  if (existing && existing.status !== APPLICATION_STATUS.PENDING && existing.status !== APPLICATION_STATUS.WITHDRAWN) {
    return NextResponse.json({ error: "La tua candidatura non è più modificabile." }, { status: 409 });
  }

  const application = await prisma.application.upsert({
    where: { requestId_transporterId: { requestId, transporterId: user.id } },
    create: { requestId, transporterId: user.id, priceCents, message },
    update: { priceCents, message, status: APPLICATION_STATUS.PENDING },
  });

  if (!existing || existing.status === APPLICATION_STATUS.WITHDRAWN) {
    const me = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyName: true, firstName: true, lastName: true },
    });
    await notifyNewApplication(load.company, load, displayName(me ?? {}), priceCents);
  }

  return NextResponse.json({ ok: true, id: application.id }, { status: existing ? 200 : 201 });
}
