import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { reopenAfterSelection } from "@/lib/load-flow";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS, REQUEST_STATUS, canRelease } from "@/lib/request-flow";

/**
 * - withdraw: il trasportatore ritira una candidatura non ancora scelta.
 * - decline: il trasportatore scelto rinuncia prima di confermare.
 * - release: l'azienda sostituisce lo scelto che non ha confermato in 24 ore.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const applicationId = Number(params.id);
  if (!Number.isInteger(applicationId)) return NextResponse.json({ error: "Candidatura non valida" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { action?: string } | null;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      selectedAt: true,
      transporterId: true,
      request: { select: { companyId: true, status: true } },
    },
  });
  if (!app) return NextResponse.json({ error: "Candidatura non trovata" }, { status: 404 });

  const isCandidate = user.role === "TRANSPORTER" && app.transporterId === user.id;
  const isOwner = user.role === "COMPANY" && app.request.companyId === user.id;

  switch (body?.action) {
    case "withdraw": {
      if (!isCandidate) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
      if (app.status !== APPLICATION_STATUS.PENDING) {
        return NextResponse.json({ error: "Questa candidatura non si può più ritirare." }, { status: 409 });
      }
      await prisma.application.update({ where: { id: app.id }, data: { status: APPLICATION_STATUS.WITHDRAWN } });
      return NextResponse.json({ ok: true });
    }
    case "decline": {
      if (!isCandidate) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
      if (app.status !== APPLICATION_STATUS.SELECTED || app.request.status !== REQUEST_STATUS.ASSIGNED) {
        return NextResponse.json({ error: "Non c'è nulla a cui rinunciare." }, { status: 409 });
      }
      const ok = await reopenAfterSelection(app.id, "DECLINED");
      return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Operazione non riuscita." }, { status: 409 });
    }
    case "release": {
      if (!isOwner) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
      if (app.status !== APPLICATION_STATUS.SELECTED || app.request.status !== REQUEST_STATUS.ASSIGNED) {
        return NextResponse.json({ error: "Questo trasportatore non è in attesa di conferma." }, { status: 409 });
      }
      if (!canRelease(app.selectedAt)) {
        return NextResponse.json(
          { error: "Il trasportatore ha 24 ore per confermare. Riprova più tardi." },
          { status: 409 },
        );
      }
      const ok = await reopenAfterSelection(app.id, "RELEASED");
      return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Operazione non riuscita." }, { status: 409 });
    }
    default:
      return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
  }
}
