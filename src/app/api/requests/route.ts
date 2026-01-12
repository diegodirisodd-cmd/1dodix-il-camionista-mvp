import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RequestPayload = {
  title?: string;
  description?: string;
  price?: number | string;
  contactsUnlockedByCompany?: boolean;
};

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

  const body: RequestPayload = await request.json();

  console.log("REQUEST BODY:", body);

  if (!body.title || !body.description || !body.price) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const priceNumber = Number(body.price);

  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    return NextResponse.json({ error: "Prezzo non valido" }, { status: 400 });
  }

  const priceInCents = Math.round(priceNumber * 100);

  try {
    const newRequest = await prisma.request.create({
      data: {
        title: body.title.trim(),
        description: body.description.trim(),
        price: priceInCents,
        contactsUnlockedByCompany: Boolean(body.contactsUnlockedByCompany),
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
