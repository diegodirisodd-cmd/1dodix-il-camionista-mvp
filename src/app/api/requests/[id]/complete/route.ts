import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user || user.role !== "TRANSPORTER") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const requestId = Number(params.id);

  if (!Number.isFinite(requestId)) {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const requestRecord = await prisma.request.findUnique({
    where: { id: requestId },
    select: { transporterId: true, status: true },
  });

  if (!requestRecord) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (requestRecord.transporterId !== user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  if (requestRecord.status !== "IN_CORSO") {
    return NextResponse.json({ error: "Stato non valido" }, { status: 409 });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: { status: "COMPLETATO" },
  });

  return NextResponse.json({ ok: true });
}
