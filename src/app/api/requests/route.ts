import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RequestPayload = {
  pickup?: string;
  delivery?: string;
  cargo?: string;
  cargoType?: string;
  description?: string;
  price?: number | string;
  budget?: number | string;
  priceString?: string;
};

export async function GET() {
  const user = await getSessionUser();
  const pathname = "/api/requests";

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const whereClause =
      user.role === "COMPANY"
        ? { companyId: user.id }
        : user.role === "TRANSPORTER"
          ? { transporterId: null }
          : undefined;

    const requests = await prisma.request.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        pickup: true,
        delivery: true,
        cargo: true,
        price: true,
        createdAt: true,
        transporterId: true,
        contactsUnlocked: true,
        companyId: true,
        company: { select: { email: true, phone: true } },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[Requests API] load failed", {
      pathname,
      userId: user.id,
      role: user.role,
      error,
    });
    if (error instanceof Error) {
      console.error(error.message, error.stack);
    }
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

  const rawPrice = body.price ?? body.budget ?? body.priceString;

  if (!rawPrice) {
    return NextResponse.json({ error: "Prezzo obbligatorio" }, { status: 400 });
  }

  const priceNumber = Number(rawPrice);

  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    return NextResponse.json({ error: "Prezzo non valido" }, { status: 400 });
  }

  const priceInCents = Math.round(priceNumber * 100);
  const pickup = body.pickup?.trim() ?? "";
  const delivery = body.delivery?.trim() ?? "";
  const cargo = body.cargo?.trim() ?? body.cargoType?.trim() ?? null;
  const description = body.description?.trim() || null;

  if (!pickup || !delivery) {
    return NextResponse.json({ error: "Ritiro e consegna obbligatori." }, { status: 400 });
  }

  try {
    const newRequest = await prisma.request.create({
      data: {
        pickup,
        delivery,
        cargo,
        description,
        price: priceInCents,
        companyId: user.id,
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
