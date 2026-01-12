import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RequestPayload = {
  title?: string;
  description?: string;
  pickup?: string;
  dropoff?: string;
  cargo?: string;
  price?: number | string;
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

export async function GET() {
  const user = await getSessionUser();

  const isCompany = user?.role === "COMPANY";
  const isAdmin = user?.role === "ADMIN";

  const requests = await prisma.request.findMany({
    where: isCompany && !isAdmin && user ? { companyId: user.id } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Gli admin possono solo consultare le richieste" }, { status: 403 });
  }

  if (user.role !== "COMPANY") {
    return NextResponse.json({ error: "Solo le aziende possono pubblicare richieste" }, { status: 403 });
  }

  const data: RequestPayload = await request.json();
  const priceCents = data.priceCents ?? parsePriceToCents(data.price ?? data.budget);
  const pickup = data.pickup?.trim() ?? "";
  const dropoff = data.dropoff?.trim() ?? "";
  const title = data.title?.trim() || (pickup && dropoff ? `${pickup} → ${dropoff}` : "");
  const descriptionParts = [
    data.description?.trim(),
    pickup && dropoff ? `Percorso: ${pickup} → ${dropoff}` : null,
    data.cargo?.trim() ? `Carico: ${data.cargo.trim()}` : null,
  ].filter(Boolean) as string[];
  const description = descriptionParts.join("\n").trim();

  if (!title) {
    return NextResponse.json({ error: "Titolo mancante." }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ error: "Descrizione mancante." }, { status: 400 });
  }

  if (!priceCents || priceCents <= 0) {
    return NextResponse.json({ error: "Importo non valido o mancante." }, { status: 400 });
  }

  try {
    const newRequest = await prisma.request.create({
      data: {
        title,
        description,
        price: priceCents,
        contactsUnlockedByCompany: Boolean(data.contactsUnlockedByCompany),
        companyId: user.id,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Errore creazione richiesta", error);
    return NextResponse.json({ error: "Impossibile creare la richiesta" }, { status: 500 });
  }
}
