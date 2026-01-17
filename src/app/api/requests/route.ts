import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RequestPayload = {
  pickup?: string;
  delivery?: string;
  cargoType?: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  price?: number | string;
  contactsUnlockedByCompany?: boolean;
};

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const whereClause =
      user.role === "COMPANY"
        ? { companyId: user.id }
        : user.role === "TRANSPORTER"
          ? {
              OR: [
                { status: "OPEN" },
                { transporterId: user.id },
              ],
            }
          : undefined;

    const requests = await prisma.request.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        price: true,
        status: true,
        createdAt: true,
        contactsUnlockedByCompany: true,
        contactsUnlockedByTransporter: true,
        company: { select: { email: true, phone: true } },
        transporter: { select: { email: true, phone: true } },
      },
    });

    return NextResponse.json(
      requests.map((request) => ({
        ...request,
        pickup: null,
        delivery: null,
      })),
    );
  } catch (error) {
    console.error("Errore caricamento richieste", error);
    return NextResponse.json({ error: "Impossibile caricare le richieste" }, { status: 500 });
  }
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

  const body: RequestPayload = await request.json();

  console.log("REQUEST BODY:", body);

  if (!body.price) {
    return NextResponse.json({ error: "Prezzo obbligatorio" }, { status: 400 });
  }

  const priceNumber = Number(body.price);

  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    return NextResponse.json({ error: "Prezzo non valido" }, { status: 400 });
  }

  const priceInCents = Math.round(priceNumber * 100);
  const pickup = body.pickup?.trim() ?? "";
  const delivery = body.delivery?.trim() ?? "";
  const title = pickup && delivery ? `${pickup} → ${delivery}` : "Richiesta di trasporto";
  const descriptionParts = [
    body.description?.trim(),
    pickup && delivery ? `Percorso: ${pickup} → ${delivery}` : null,
    body.cargoType?.trim() ? `Carico: ${body.cargoType.trim()}` : null,
  ].filter(Boolean) as string[];
  const description = descriptionParts.join("\n").trim();

  try {
    const newRequest = await prisma.request.create({
      data: {
        title,
        description,
        price: priceInCents,
        contactsUnlockedByCompany: Boolean(body.contactsUnlockedByCompany),
        companyId: user.id,
        status: "OPEN",
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);
    return NextResponse.json(
      { error: "Impossibile creare la richiesta", details: String(error) },
      { status: 500 },
    );
  }
}
