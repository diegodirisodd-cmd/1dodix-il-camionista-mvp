import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user || user.role !== "TRANSPORTER") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { phone?: string } | null;
  const normalizedPhone = payload?.phone?.trim() ?? "";

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { phone: normalizedPhone || null },
  });

  return NextResponse.json({ phone: updated.phone });
}
