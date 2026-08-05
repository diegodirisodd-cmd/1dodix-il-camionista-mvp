import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRequestServices } from "@/lib/roles";
import { withSignedPhotoUrls } from "@/lib/supabase-storage";

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
      quotes: {
        include: {
          supplier: {
            select: {
              id: true,
              ragioneSociale: true,
              userId: true,
              partitaIva: true,
              user: { select: { email: true, phone: true, city: true, province: true } },
            },
          },
        },
        orderBy: { priceCents: "asc" },
      },
      unlocks: true,
    },
  });

  if (!serviceRequest) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  const isOwner = canRequestServices(user.role) && serviceRequest.transporterId === user.id;
  const isAdmin = user.role === "ADMIN";

  let supplierProfileId: number | null = null;
  if (user.role === "SUPPLIER") {
    const profile = await prisma.supplierProfile.findUnique({ where: { userId: user.id } });
    supplierProfileId = profile?.id ?? null;
  }

  if (!isOwner && !isAdmin && !supplierProfileId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  // Chi ha pubblicato vede il contatto del fornitore solo per il preventivo
  // che ha scelto; il fornitore vede il contatto del cliente solo se ha
  // sbloccato quella specifica richiesta (o se è già stato assegnato).
  const unlockedForThisSupplier = supplierProfileId
    ? serviceRequest.unlocks.some((u: { supplierId: number }) => u.supplierId === supplierProfileId)
    : false;

  const isAssignedSupplier =
    supplierProfileId !== null &&
    serviceRequest.quotes.some(
      (q) => q.supplierId === supplierProfileId && q.id === serviceRequest.assignedQuoteId,
    );

  const canSeeTransporterContact =
    isOwner || isAdmin || unlockedForThisSupplier || isAssignedSupplier;

  // Un fornitore vede solo il proprio preventivo tra i dettagli economici altrui;
  // chi ha pubblicato (proprietario) vede tutti i preventivi ricevuti.
  const visibleQuotes =
    isOwner || isAdmin
      ? serviceRequest.quotes
      : serviceRequest.quotes.filter((q: { supplierId: number }) => q.supplierId === supplierProfileId);

  // Simmetrico al mascheramento del cliente: il proprietario vede i recapiti
  // del fornitore solo per il preventivo che ha effettivamente scelto (il
  // fornitore, dal canto suo, paga per vedere quelli del cliente).
  const sanitizedQuotes = visibleQuotes.map((quote) => {
    const canSeeSupplierContact =
      isAdmin ||
      quote.supplierId === supplierProfileId ||
      (isOwner && quote.id === serviceRequest.assignedQuoteId);

    return {
      ...quote,
      supplier: {
        ...quote.supplier,
        user: canSeeSupplierContact
          ? quote.supplier.user
          : { ...quote.supplier.user, email: null, phone: null },
      },
    };
  });

  const sanitized = {
    ...serviceRequest,
    fotos: await withSignedPhotoUrls(serviceRequest.fotos),
    transporter: canSeeTransporterContact
      ? serviceRequest.transporter
      : { ...serviceRequest.transporter, email: null, phone: null },
    quotes: sanitizedQuotes,
    // Stato di sblocco del fornitore che sta guardando, senza esporre
    // l'elenco completo di chi ha pagato.
    unlocks: isOwner || isAdmin ? serviceRequest.unlocks : undefined,
    contactUnlockedByMe: unlockedForThisSupplier,
    viewerSupplierProfileId: supplierProfileId,
  };

  return NextResponse.json(sanitized);
}
