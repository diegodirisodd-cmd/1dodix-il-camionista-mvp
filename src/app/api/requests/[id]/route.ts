import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RequestPayload = {
  priceCents?: number;
  budget?: string;
  contactsUnlockedByCompany?: boolean;
};

function parsePriceToCents(value?: number | string | null) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value * 100) : null;
  const normalized = value.replace(/[^\d,.-]/g, "");
  if (!normalized) return null;
  const withDecimal = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;
  const parsed = Number.parseFloat(withDecimal);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const requestRecord = await prisma.request.findUnique({ where: { id: Number(params.id) } });

  if (!requestRecord) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  return NextResponse.json(requestRecord);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const existing = await prisma.request.findUnique({ where: { id: Number(params.id) } });

  if (!existing) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Gli admin possono solo consultare le richieste" }, { status: 403 });
  }

  if (user.role !== "COMPANY" || existing.companyId !== user.id) {
    return NextResponse.json({ error: "Non autorizzato a modificare questa richiesta" }, { status: 403 });
  }

  const data: RequestPayload = await request.json();
  const priceCents = data.priceCents ?? parsePriceToCents(data.budget);

  if (!priceCents) {
    return NextResponse.json({ error: "Importo non valido o mancante." }, { status: 400 });
  }

  const updated = await prisma.request.update({
    where: { id: existing.id },
    data: {
      priceCents,
      contactsUnlockedByCompany: Boolean(data.contactsUnlockedByCompany),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const existing = await prisma.request.findUnique({ where: { id: Number(params.id) } });

  if (!existing) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Gli admin possono solo consultare le richieste" }, { status: 403 });
  }

  if (user.role !== "COMPANY" || existing.companyId !== user.id) {
    return NextResponse.json({ error: "Non autorizzato a eliminare questa richiesta" }, { status: 403 });
  }

  await prisma.request.delete({ where: { id: existing.id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { unlock?: "company" | "transporter" } | null;
  const unlockTarget = payload?.unlock;

  if (!unlockTarget) {
    return NextResponse.json({ error: "Parametro unlock mancante" }, { status: 400 });
  }

  const existing = await prisma.request.findUnique({ where: { id: Number(params.id) } });

  if (!existing) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Gli admin non possono sbloccare contatti" }, { status: 403 });
  }

  if (unlockTarget === "company") {
    if (user.role !== "COMPANY" || existing.companyId !== user.id) {
      return NextResponse.json({ error: "Non autorizzato a sbloccare questi contatti" }, { status: 403 });
    }
  }

  if (unlockTarget === "transporter" && user.role !== "TRANSPORTER") {
    return NextResponse.json({ error: "Non autorizzato a sbloccare questi contatti" }, { status: 403 });
  }

  const updated = await prisma.request.update({
    where: { id: existing.id },
    data:
      unlockTarget === "company"
        ? { contactsUnlockedByCompany: true }
        : { contactsUnlockedByTransporter: true },
  });

  return NextResponse.json(updated);
}
