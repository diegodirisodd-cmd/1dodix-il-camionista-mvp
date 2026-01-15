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

  const requestRecord = await prisma.request.findUnique({ where: { id: requestId } });

  if (!requestRecord) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (requestRecord.status !== "OPEN" || requestRecord.transporterId) {
    return NextResponse.json({ error: "Richiesta non disponibile" }, { status: 400 });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: { transporterId: user.id, status: "ASSIGNED" },
  });

  return NextResponse.json({ success: true });
}
