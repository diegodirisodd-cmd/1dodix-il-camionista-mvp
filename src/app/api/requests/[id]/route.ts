import { NextResponse } from "next/server";

import type { Request as RequestModel } from "@prisma/client";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REQUIRED_FIELDS = ["title", "pickup", "dropoff", "contactName", "contactPhone", "contactEmail"] as const;

type RequestPayload = {
  title?: string;
  pickup?: string;
  dropoff?: string;
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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (!user.subscriptionActive) {
    return NextResponse.json({ error: "Abbonamento richiesto" }, { status: 402 });
  }

  const requestRecord = await prisma.request.findUnique({ where: { id: Number(params.id) } });

  if (!requestRecord) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  const includeContact = user.role === "COMPANY" && requestRecord.companyId === user.id
    ? true
    : user.subscriptionActive;

  return NextResponse.json(sanitizeRequestOutput(requestRecord, includeContact));
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (!user.subscriptionActive) {
    return NextResponse.json({ error: "Abbonamento richiesto" }, { status: 402 });
  }

  const existing = await prisma.request.findUnique({ where: { id: Number(params.id) } });

  if (!existing) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (user.role !== "COMPANY" || existing.companyId !== user.id) {
    return NextResponse.json({ error: "Non autorizzato a modificare questa richiesta" }, { status: 403 });
  }

  const data: RequestPayload = await request.json();
  const missingFields = REQUIRED_FIELDS.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Campi obbligatori mancanti: ${missingFields.join(", ")}` },
      { status: 400 },
    );
  }

  const updated = await prisma.request.update({
    where: { id: existing.id },
    data: {
      title: data.title!,
      pickup: data.pickup!,
      dropoff: data.dropoff!,
      cargo: data.cargo,
      budget: data.budget,
      description: data.description,
      contactName: data.contactName!,
      contactPhone: data.contactPhone!,
      contactEmail: data.contactEmail!,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (!user.subscriptionActive) {
    return NextResponse.json({ error: "Abbonamento richiesto" }, { status: 402 });
  }

  const existing = await prisma.request.findUnique({ where: { id: Number(params.id) } });

  if (!existing) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (user.role !== "COMPANY" || existing.companyId !== user.id) {
    return NextResponse.json({ error: "Non autorizzato a eliminare questa richiesta" }, { status: 403 });
  }

  await prisma.request.delete({ where: { id: existing.id } });

  return NextResponse.json({ success: true });
}
