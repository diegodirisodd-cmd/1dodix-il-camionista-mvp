import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user || user.role !== "TRANSPORTER") {
    if (process.env.NODE_ENV === "development") {
      console.warn("Tentativo non autorizzato di accettare richiesta");
    }
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

  if (requestRecord.status !== "PUBLISHED") {
    if (process.env.NODE_ENV === "development") {
      console.warn("Tentativo di accettare richiesta con status non PUBLISHED", {
        requestId,
        status: requestRecord.status,
      });
    }
    return NextResponse.json({ error: "Questo trasporto è già stato assegnato." }, { status: 400 });
  }

  if (requestRecord.acceptedByTransporterId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Tentativo di accettare richiesta già assegnata", { requestId });
    }
    return NextResponse.json({ error: "Questo trasporto è già stato assegnato." }, { status: 400 });
  }

  const updated = await prisma.request.update({
    where: { id: requestId },
    data: {
      acceptedByTransporterId: user.id,
      transporterId: user.id,
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
