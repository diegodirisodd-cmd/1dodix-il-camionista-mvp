import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const requestId = Number(params.id);

  if (!Number.isFinite(requestId)) {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const requestRecord = await prisma.request.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      companyId: true,
      transporterId: true,
      unlockedByCompany: true,
      unlockedByTransporter: true,
    },
  });

  if (!requestRecord) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  const canAccess =
    user.role === "ADMIN" ||
    (user.role === "COMPANY" && requestRecord.companyId === user.id) ||
    (user.role === "TRANSPORTER" &&
      (requestRecord.transporterId === null || requestRecord.transporterId === user.id));

  if (!canAccess) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ ok: true });
  }

  const shouldUnlockCompany = user.role === "COMPANY";
  const shouldUnlockTransporter = user.role === "TRANSPORTER";

  if (shouldUnlockCompany && requestRecord.unlockedByCompany) {
    return NextResponse.json({ ok: true });
  }

  if (shouldUnlockTransporter && requestRecord.unlockedByTransporter) {
    return NextResponse.json({ ok: true });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: {
      unlockedByCompany: shouldUnlockCompany ? true : undefined,
      unlockedByTransporter: shouldUnlockTransporter ? true : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
