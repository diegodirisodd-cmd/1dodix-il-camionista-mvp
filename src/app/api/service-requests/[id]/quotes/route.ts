import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailShell } from "@/lib/email";
import {
  SERVICE_CATEGORY_LABELS,
  formatCents,
  type ServiceCategory,
} from "@/lib/service-categories";

type QuotePayload = {
  priceCents?: number | string;
  price?: number | string;
  tempi?: string;
  disponibilita?: string;
};

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Solo i fornitori possono inviare preventivi" }, { status: 403 });
  }

  const requestId = Number(params.id);
  if (!Number.isFinite(requestId)) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId: user.id } });
  if (!supplierProfile) {
    return NextResponse.json(
      { error: "Completa prima il profilo fornitore" },
      { status: 400 },
    );
  }

  const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!serviceRequest) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (serviceRequest.stato === "ASSEGNATA" || serviceRequest.stato === "CONCLUSA" || serviceRequest.stato === "ANNULLATA") {
    return NextResponse.json({ error: "Questa richiesta non accetta più preventivi" }, { status: 400 });
  }

  const body: QuotePayload = await request.json();
  const rawPrice = body.priceCents ?? body.price;
  const tempi = body.tempi?.trim();
  const disponibilita = body.disponibilita?.trim();

  if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
    return NextResponse.json({ error: "Prezzo obbligatorio" }, { status: 400 });
  }
  const priceNumber = Number(rawPrice);
  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    return NextResponse.json({ error: "Prezzo non valido" }, { status: 400 });
  }
  // priceCents se già in centesimi (intero grande), altrimenti trattalo come euro.
  const priceCents = body.priceCents ? Math.round(priceNumber) : Math.round(priceNumber * 100);

  if (!tempi || !disponibilita) {
    return NextResponse.json({ error: "Tempi di intervento e disponibilità obbligatori" }, { status: 400 });
  }

  try {
    const quote = await prisma.serviceQuote.upsert({
      where: { requestId_supplierId: { requestId, supplierId: supplierProfile.id } },
      create: {
        requestId,
        supplierId: supplierProfile.id,
        priceCents,
        tempi,
        disponibilita,
      },
      update: { priceCents, tempi, disponibilita },
    });

    if (serviceRequest.stato === "APERTA") {
      await prisma.serviceRequest.update({
        where: { id: requestId },
        data: { stato: "IN_TRATTATIVA" },
      });
    }

    const transporter = await prisma.user.findUnique({
      where: { id: serviceRequest.transporterId },
      select: { email: true },
    });

    if (transporter?.email) {
      await sendEmail({
        to: transporter.email,
        subject: "Hai ricevuto un nuovo preventivo su DodiX",
        html: emailShell(
          "Nuovo preventivo ricevuto",
          `<p>${supplierProfile.ragioneSociale} ha inviato un preventivo per la tua richiesta
              <strong>#${requestId}</strong> (${
                SERVICE_CATEGORY_LABELS[serviceRequest.categoria as ServiceCategory] ??
                serviceRequest.categoria
              }).</p>
           <p><strong>Prezzo proposto:</strong> ${formatCents(priceCents)} (IVA esclusa)<br />
              <strong>Tempi di intervento:</strong> ${tempi}</p>`,
          `${baseUrl}/dashboard/services/${requestId}`,
          "Confronta le offerte",
        ),
      });
    }

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error("[ServiceQuotes API] create failed", error);
    return NextResponse.json({ error: "Impossibile inviare il preventivo" }, { status: 500 });
  }
}
