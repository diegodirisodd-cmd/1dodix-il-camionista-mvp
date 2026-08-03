import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      fotos: true,
      transporter: { select: { id: true, companyName: true, city: true, province: true, email: true, phone: true } },
      quotes: { include: { supplier: { select: { id: true, ragioneSociale: true, userId: true } } } },
      unlocks: true,
    },
  });

  if (!serviceRequest) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  const isOwner = user.role === "TRANSPORTER" && serviceRequest.transporterId === user.id;
  const isAdmin = user.role === "ADMIN";

  let supplierProfileId: number | null = null;
  if (user.role === "SUPPLIER") {
    const profile = await prisma.supplierProfile.findUnique({ where: { userId: user.id } });
    supplierProfileId = profile?.id ?? null;
  }

  if (!isOwner && !isAdmin && !supplierProfileId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  // Il trasportatore vede il contatto del fornitore solo per il preventivo
  // che ha scelto; il fornitore vede il contatto del trasportatore solo se
  // ha sbloccato quella specifica richiesta (o se è già stato assegnato).
  const unlockedForThisSupplier = supplierProfileId
    ? serviceRequest.unlocks.some((u: { supplierId: number }) => u.supplierId === supplierProfileId)
    : false;

  const canSeeTransporterContact =
    isOwner || isAdmin || unlockedForThisSupplier || serviceRequest.assignedQuoteId
      ? isOwner ||
        isAdmin ||
        unlockedForThisSupplier ||
        (supplierProfileId !== null &&
          serviceRequest.quotes.some(
            (q) => q.supplierId === supplierProfileId && q.id === serviceRequest.assignedQuoteId,
          ))
      : false;

  const sanitized = {
    ...serviceRequest,
    transporter: canSeeTransporterContact
      ? serviceRequest.transporter
      : { ...serviceRequest.transporter, email: null, phone: null },
    // Un fornitore vede solo il proprio preventivo tra i dettagli economici altrui;
    // il trasportatore (proprietario) vede tutti i preventivi ricevuti.
    quotes:
      isOwner || isAdmin
        ? serviceRequest.quotes
        : serviceRequest.quotes.filter((q: { supplierId: number }) => q.supplierId === supplierProfileId),
  };

  return NextResponse.json(sanitized);
}
