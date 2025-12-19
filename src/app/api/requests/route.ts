import { NextResponse } from "next/server";

import type { Request as RequestModel } from "@prisma/client";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REQUIRED_FIELDS = [
  "pickup",
  "dropoff",
  "timeWindow",
  "cargoType",
  "estimatedWeight",
  "contactName",
  "contactPhone",
  "contactEmail",
] as const;

type RequestPayload = {
  pickup?: string;
  dropoff?: string;
  timeWindow?: string;
  cargoType?: string;
  estimatedWeight?: string;
  cargo?: string;
  budget?: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
};

function sanitizeRequestOutput(request: RequestModel, includeContact: boolean) {
  if (includeContact) return request;

  const { contactName, contactPhone, contactEmail, ...rest } = request;
  return {
    ...rest,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    contactHidden: true,
  };
}

export async function GET() {
  const user = await getSessionUser();

  const isCompany = user?.role === "COMPANY";
  const isAdmin = user?.role === "ADMIN";
  const includeContact = Boolean(isCompany || isAdmin || user?.subscriptionActive);

  const requests = await prisma.request.findMany({
    where: isCompany && !isAdmin && user ? { companyId: user.id } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests.map((request) => sanitizeRequestOutput(request, includeContact)));
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

  if (!user.subscriptionActive) {
    return NextResponse.json({ error: "Abbonamento richiesto per creare una richiesta" }, { status: 402 });
  }

  const data: RequestPayload = await request.json();
  const missingFields = REQUIRED_FIELDS.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Campi obbligatori mancanti: ${missingFields.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const derivedTitle = data.title?.trim() || `${data.pickup} → ${data.dropoff}`;

    const newRequest = await prisma.request.create({
      data: {
        title: derivedTitle,
        pickup: data.pickup!,
        dropoff: data.dropoff!,
        timeWindow: data.timeWindow!,
        cargoType: data.cargoType!,
        estimatedWeight: data.estimatedWeight!,
        cargo: data.cargo,
        budget: data.budget,
        description: data.description,
        contactName: data.contactName!,
        contactPhone: data.contactPhone!,
        contactEmail: data.contactEmail!,
        companyId: user.id,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Errore creazione richiesta", error);
    return NextResponse.json({ error: "Impossibile creare la richiesta" }, { status: 500 });
  }
}
