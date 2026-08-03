import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailShell } from "@/lib/email";
import { SERVICE_CATEGORY_LABELS, type ServiceCategory } from "@/lib/service-categories";

type AssignPayload = {
  quoteId?: number | string;
};

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const requestId = Number(params.id);
  if (!Number.isFinite(requestId)) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  const body: AssignPayload = await request.json();
  const quoteId = Number(body.quoteId);

  if (!Number.isFinite(quoteId)) {
    return NextResponse.json({ error: "Preventivo non valido" }, { status: 400 });
  }

  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { quotes: true },
  });

  if (!serviceRequest) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (user.role !== "TRANSPORTER" || serviceRequest.transporterId !== user.id) {
    return NextResponse.json(
      { error: "Solo il proprietario della richiesta può assegnare un preventivo" },
      { status: 403 },
    );
  }

  if (serviceRequest.stato === "CONCLUSA" || serviceRequest.stato === "ANNULLATA") {
    return NextResponse.json(
      { error: "Questa richiesta è già chiusa" },
      { status: 400 },
    );
  }

  const quote = serviceRequest.quotes.find((q: { id: number }) => q.id === quoteId);

  if (!quote) {
    return NextResponse.json(
      { error: "Il preventivo selezionato non appartiene a questa richiesta" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { assignedQuoteId: quote.id, stato: "ASSEGNATA" },
      include: {
        fotos: true,
        quotes: { include: { supplier: true } },
      },
    });

    void notifyAssignedSupplier(quote.supplierId, requestId, serviceRequest.categoria as ServiceCategory);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ServiceRequests API] assign failed", error);
    return NextResponse.json({ error: "Impossibile assegnare il preventivo" }, { status: 500 });
  }
}

async function notifyAssignedSupplier(
  supplierId: number,
  requestId: number,
  categoria: ServiceCategory,
) {
  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      include: { user: { select: { email: true } } },
    });

    if (!supplier?.user.email) return;

    await sendEmail({
      to: supplier.user.email,
      subject: "Il tuo preventivo è stato accettato su DodiX",
      html: emailShell(
        "Preventivo accettato",
        `<p>Il tuo preventivo per un intervento di <strong>${
          SERVICE_CATEGORY_LABELS[categoria] ?? categoria
        }</strong> è stato scelto dal trasportatore.</p>
         <p>Apri la richiesta per vedere i dettagli e organizzare l'intervento.</p>`,
        `${baseUrl}/dashboard/services/${requestId}`,
        "Apri la richiesta",
      ),
    });
  } catch (error) {
    console.error("[ServiceRequests API] notifica assegnazione fallita", error);
  }
}
