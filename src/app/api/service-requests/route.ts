import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailShell } from "@/lib/email";
import { signServicePhotoPaths } from "@/lib/supabase-storage";
import {
  isServiceCategory,
  isUrgencyLevel,
  SERVICE_CATEGORY_LABELS,
  type ServiceCategory,
} from "@/lib/service-categories";

type ServiceRequestPayload = {
  categoria?: string;
  posizione?: string;
  provincia?: string;
  marcaVeicolo?: string;
  tipoVeicolo?: string;
  descrizione?: string;
  urgenza?: string;
  scadenza?: string;
  fotoUrls?: string[];
};

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// Le foto sono su un bucket privato: in DB c'è il path dell'oggetto, qui lo
// trasformiamo in URL firmato (una sola chiamata per tutta la lista).
async function withSignedPhotos<T extends { fotos: { url: string }[] }>(requests: T[]) {
  const signed = await signServicePhotoPaths(
    requests.flatMap((serviceRequest) => serviceRequest.fotos.map((foto) => foto.url)),
  );

  return requests.map((serviceRequest) => ({
    ...serviceRequest,
    fotos: serviceRequest.fotos.map((foto) => ({ ...foto, url: signed.get(foto.url) ?? foto.url })),
  }));
}

export async function GET(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statoFilter = searchParams.get("stato") ?? undefined;

  try {
    if (user.role === "TRANSPORTER") {
      const requests = await prisma.serviceRequest.findMany({
        where: { transporterId: user.id, ...(statoFilter ? { stato: statoFilter } : {}) },
        orderBy: { createdAt: "desc" },
        include: {
          fotos: true,
          quotes: { include: { supplier: true } },
        },
      });
      return NextResponse.json(await withSignedPhotos(requests));
    }

    if (user.role === "SUPPLIER") {
      const supplierProfile = await prisma.supplierProfile.findUnique({
        where: { userId: user.id },
        include: { aree: true },
      });

      if (!supplierProfile) {
        return NextResponse.json([]);
      }

      const categorie = Array.from(
        new Set(supplierProfile.aree.map((a: { categoria: string }) => a.categoria)),
      );
      const province = Array.from(
        new Set(supplierProfile.aree.map((a: { provincia: string }) => a.provincia)),
      );

      if (categorie.length === 0 || province.length === 0) {
        return NextResponse.json([]);
      }

      const requests = await prisma.serviceRequest.findMany({
        where: {
          stato: statoFilter ?? "APERTA",
          categoria: { in: categorie },
          provincia: { in: province },
        },
        orderBy: { createdAt: "desc" },
        include: {
          fotos: true,
          transporter: { select: { companyName: true, city: true, province: true } },
          quotes: { where: { supplierId: supplierProfile.id } },
        },
      });
      return NextResponse.json(await withSignedPhotos(requests));
    }

    if (user.role === "ADMIN") {
      const requests = await prisma.serviceRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { fotos: true, quotes: true },
      });
      return NextResponse.json(await withSignedPhotos(requests));
    }

    return NextResponse.json({ error: "Ruolo non abilitato a Borsa Servizi" }, { status: 403 });
  } catch (error) {
    console.error("[ServiceRequests API] load failed", error);
    return NextResponse.json({ error: "Impossibile caricare le richieste" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (user.role !== "TRANSPORTER") {
    return NextResponse.json(
      { error: "Solo i trasportatori possono pubblicare richieste di servizio" },
      { status: 403 },
    );
  }

  const body: ServiceRequestPayload = await request.json();

  const categoria = body.categoria;
  const posizione = body.posizione?.trim();
  const provincia = body.provincia?.trim().toUpperCase();
  const marcaVeicolo = body.marcaVeicolo?.trim();
  const tipoVeicolo = body.tipoVeicolo?.trim();
  const descrizione = body.descrizione?.trim();
  const urgenza = body.urgenza;
  const scadenzaDate = body.scadenza ? new Date(body.scadenza) : null;

  if (!isServiceCategory(categoria)) {
    return NextResponse.json({ error: "Categoria non valida" }, { status: 400 });
  }
  if (!isUrgencyLevel(urgenza)) {
    return NextResponse.json({ error: "Livello di urgenza non valido" }, { status: 400 });
  }
  if (!posizione || !provincia || !marcaVeicolo || !tipoVeicolo || !descrizione) {
    return NextResponse.json(
      { error: "Posizione, provincia, marca/tipo veicolo e descrizione sono obbligatori" },
      { status: 400 },
    );
  }
  if (!scadenzaDate || Number.isNaN(scadenzaDate.getTime())) {
    return NextResponse.json({ error: "Data entro cui serve l'intervento non valida" }, { status: 400 });
  }

  try {
    const created = await prisma.serviceRequest.create({
      data: {
        transporterId: user.id,
        categoria,
        posizione,
        provincia,
        marcaVeicolo,
        tipoVeicolo,
        descrizione,
        urgenza,
        scadenza: scadenzaDate,
        fotos: body.fotoUrls?.length
          ? { create: body.fotoUrls.map((url) => ({ url })) }
          : undefined,
      },
      include: { fotos: true },
    });

    // Notifica via email ai fornitori compatibili per categoria + provincia.
    void notifyMatchingSuppliers(created.id, categoria as ServiceCategory, provincia);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[ServiceRequests API] create failed", error);
    return NextResponse.json({ error: "Impossibile creare la richiesta" }, { status: 500 });
  }
}

async function notifyMatchingSuppliers(
  requestId: number,
  categoria: ServiceCategory,
  provincia: string,
) {
  try {
    const areas = await prisma.supplierServiceArea.findMany({
      where: { categoria, provincia },
      include: { supplier: { include: { user: { select: { email: true } } } } },
    });

    const uniqueEmails = Array.from(
      new Set(
        areas
          .map((a: { supplier: { user: { email: string } } }) => a.supplier.user.email)
          .filter(Boolean),
      ),
    );

    const html = emailShell(
      "Nuova richiesta di servizio compatibile",
      `<p>È stata pubblicata una nuova richiesta per <strong>${SERVICE_CATEGORY_LABELS[categoria]}</strong> in provincia di ${provincia}.</p>
       <p>Accedi alla tua area fornitore per vedere i dettagli e inviare un preventivo.</p>`,
      `${baseUrl}/dashboard/services/${requestId}`,
      "Vedi la richiesta",
    );

    await Promise.all(
      uniqueEmails.map((to) =>
        sendEmail({ to: to as string, subject: "Nuova richiesta di servizio su DodiX", html }),
      ),
    );
  } catch (error) {
    console.error("[ServiceRequests API] notifica fornitori fallita", error);
  }
}
