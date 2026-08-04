import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRequestServices } from "@/lib/roles";
import { type ServiceRequestStatus } from "@/lib/service-categories";

type StatusPayload = {
  stato?: string;
};

// Chi ha pubblicato la richiesta può solo chiuderla: gli stati "aperta",
// "in trattativa" e "assegnata" sono conseguenza delle azioni sui preventivi.
const CLOSABLE_STATES: ServiceRequestStatus[] = ["CONCLUSA", "ANNULLATA"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const requestId = Number(params.id);
  if (!Number.isFinite(requestId)) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  const body: StatusPayload = await request.json();
  const stato = body.stato?.toUpperCase() as ServiceRequestStatus | undefined;

  if (!stato || !CLOSABLE_STATES.includes(stato)) {
    return NextResponse.json(
      { error: "Stato non valido: sono ammessi solo CONCLUSA e ANNULLATA" },
      { status: 400 },
    );
  }

  const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id: requestId } });

  if (!serviceRequest) {
    return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  }

  if (!canRequestServices(user.role) || serviceRequest.transporterId !== user.id) {
    return NextResponse.json(
      { error: "Solo il proprietario della richiesta può cambiarne lo stato" },
      { status: 403 },
    );
  }

  if (serviceRequest.stato === "CONCLUSA" || serviceRequest.stato === "ANNULLATA") {
    return NextResponse.json({ error: "Questa richiesta è già chiusa" }, { status: 400 });
  }

  if (stato === "CONCLUSA" && !serviceRequest.assignedQuoteId) {
    return NextResponse.json(
      { error: "Assegna prima un preventivo per poter concludere la richiesta" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { stato },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ServiceRequests API] status update failed", error);
    return NextResponse.json({ error: "Impossibile aggiornare lo stato" }, { status: 500 });
  }
}
