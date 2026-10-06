import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REQUEST_STATUS } from "@/lib/request-flow";

/** Recensione dopo la consegna: l'azienda valuta il trasportatore e viceversa. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const requestId = Number(params.id);
  const load = Number.isInteger(requestId)
    ? await prisma.request.findUnique({
        where: { id: requestId },
        select: { status: true, companyId: true, transporterId: true },
      })
    : null;
  if (!load) return NextResponse.json({ error: "Carico non trovato" }, { status: 404 });
  if (load.status !== REQUEST_STATUS.DELIVERED || !load.transporterId) {
    return NextResponse.json({ error: "Puoi recensire solo dopo la consegna." }, { status: 409 });
  }

  let targetId: number;
  if (user.id === load.companyId) targetId = load.transporterId;
  else if (user.id === load.transporterId) targetId = load.companyId;
  else return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { rating?: unknown; comment?: unknown } | null;
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Valutazione da 1 a 5." }, { status: 400 });
  }
  const comment = typeof body?.comment === "string" ? body.comment.trim().slice(0, 500) || null : null;

  try {
    await prisma.review.create({ data: { requestId, authorId: user.id, targetId, rating, comment } });
  } catch {
    return NextResponse.json({ error: "Hai già lasciato una recensione per questo carico." }, { status: 409 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
