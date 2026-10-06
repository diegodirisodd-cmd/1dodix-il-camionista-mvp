import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { notifyCancelled } from "@/lib/load-notifications";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS, REQUEST_STATUS } from "@/lib/request-flow";

/**
 * Azioni sul ciclo di vita del carico:
 * - deliver: azienda o trasportatore assegnato, dopo la conferma.
 * - cancel: azienda, finche' il carico e' aperto.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const requestId = Number(params.id);
  if (!Number.isInteger(requestId)) return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { action?: string } | null;
  const action = body?.action;

  const load = await prisma.request.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, companyId: true, transporterId: true },
  });
  if (!load) return NextResponse.json({ error: "Carico non trovato" }, { status: 404 });

  const isOwner = user.role === "COMPANY" && load.companyId === user.id;
  const isAssigned = user.role === "TRANSPORTER" && load.transporterId === user.id;

  if (action === "deliver") {
    if (!isOwner && !isAssigned) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    if (load.status !== REQUEST_STATUS.CONFIRMED) {
      return NextResponse.json({ error: "Il carico non è ancora confermato da entrambi." }, { status: 409 });
    }
    await prisma.request.update({
      where: { id: requestId },
      data: { status: REQUEST_STATUS.DELIVERED, deliveredAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "cancel") {
    if (!isOwner) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    if (load.status !== REQUEST_STATUS.OPEN) {
      return NextResponse.json(
        { error: "Puoi annullare solo un carico ancora aperto (senza trasportatore scelto)." },
        { status: 409 },
      );
    }
    const pending = await prisma.application.findMany({
      where: { requestId, status: APPLICATION_STATUS.PENDING },
      select: { transporter: { select: { email: true, firstName: true, companyName: true } } },
    });
    const cancelled = await prisma.$transaction(async (tx) => {
      const r = await tx.request.updateMany({
        where: { id: requestId, status: REQUEST_STATUS.OPEN },
        data: { status: REQUEST_STATUS.CANCELLED, cancelledAt: new Date() },
      });
      if (r.count === 0) return false;
      await tx.application.updateMany({
        where: { requestId, status: APPLICATION_STATUS.PENDING },
        data: { status: APPLICATION_STATUS.REJECTED },
      });
      return true;
    });
    if (!cancelled) {
      return NextResponse.json({ error: "Il carico è appena cambiato di stato: ricarica la pagina." }, { status: 409 });
    }
    const info = await prisma.request.findUnique({ where: { id: requestId }, select: { id: true, pickup: true, delivery: true } });
    if (info) await Promise.all(pending.map((p) => notifyCancelled(p.transporter, info)));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}
