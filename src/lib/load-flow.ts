import "server-only";

import type Stripe from "stripe";
import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";
import { APPLICATION_STATUS, REQUEST_STATUS, effectivePriceCents } from "./request-flow";
import { notifyNotSelected, notifyReleased, notifySelected } from "./load-notifications";

// Operazioni di stato del flusso carichi che toccano piu' tabelle insieme.
// Tutte idempotenti: webhook Stripe e pagina di conferma possono chiamarle
// entrambe per lo stesso pagamento senza effetti doppi.

type Tx = Prisma.TransactionClient;

export function displayName(u: {
  companyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  return (
    u.companyName?.trim() ||
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    "Trasportatore DodiX"
  );
}

const personSelect = { email: true, firstName: true, companyName: true } as const;

/**
 * Assegna il carico al candidato scelto. Va chiamata solo quando l'azienda ha
 * gia' pagato (adesso o in passato per lo stesso carico).
 * Ritorna true se l'assegnazione e' avvenuta in questa chiamata.
 */
async function assignInTx(tx: Tx, applicationId: number): Promise<{ requestId: number; rejectedIds: number[] } | null> {
  const app = await tx.application.findUnique({
    where: { id: applicationId },
    include: { request: { select: { id: true, status: true, price: true } } },
  });
  if (!app) return null;
  if (app.request.status !== REQUEST_STATUS.OPEN || app.status !== APPLICATION_STATUS.PENDING) return null;

  const now = new Date();
  // Aggiornamento condizionato: se due assegnazioni corrono insieme ne passa una.
  const updated = await tx.request.updateMany({
    where: { id: app.requestId, status: REQUEST_STATUS.OPEN },
    data: {
      status: REQUEST_STATUS.ASSIGNED,
      transporterId: app.transporterId,
      selectedApplicationId: app.id,
      agreedPrice: effectivePriceCents(app.request.price, app.priceCents),
      assignedAt: now,
      acceptedAt: now,
    },
  });
  if (updated.count === 0) return null;

  await tx.application.update({
    where: { id: app.id },
    data: { status: APPLICATION_STATUS.SELECTED, selectedAt: now },
  });

  const others = await tx.application.findMany({
    where: { requestId: app.requestId, status: APPLICATION_STATUS.PENDING, id: { not: app.id } },
    select: { id: true },
  });
  // Gli altri candidati restano "in valutazione" finche' il carico non e'
  // confermato: se lo scelto rinuncia, l'azienda puo' ripescarli.
  return { requestId: app.requestId, rejectedIds: others.map((o) => o.id) };
}

async function afterAssign(applicationId: number) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      transporter: { select: personSelect },
      request: { select: { id: true, pickup: true, delivery: true, agreedPrice: true, price: true } },
    },
  });
  if (!app) return;
  await notifySelected(app.transporter, app.request, app.request.agreedPrice ?? app.request.price);
}

/** Selezione senza pagamento: l'azienda ha gia' pagato la commissione per questo carico. */
export async function selectWithExistingPayment(applicationId: number) {
  const result = await prisma.$transaction((tx) => assignInTx(tx, applicationId));
  if (result) await afterAssign(applicationId);
  return Boolean(result);
}

function paymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
}

async function recordUnlock(
  tx: Tx,
  requestId: number,
  userId: number,
  role: "COMPANY" | "TRANSPORTER",
  session: Stripe.Checkout.Session,
) {
  const data = {
    userRole: role,
    amountCents: session.amount_total ?? null,
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId(session),
  };
  await tx.requestUnlock.upsert({
    where: { requestId_userId: { requestId, userId } },
    create: { requestId, userId, ...data },
    update: data,
  });
}

/**
 * Applica un checkout Stripe pagato per un carico.
 * - kind SELECT_APPLICATION: l'azienda sceglie un candidato e paga.
 * - ruolo TRANSPORTER: il trasportatore scelto conferma pagando.
 */
export async function applyLoadCheckout(session: Stripe.Checkout.Session): Promise<{ ok: boolean; reason?: string }> {
  if (session.payment_status !== "paid") return { ok: false, reason: "non pagato" };
  if (!session.amount_total || session.amount_total <= 0) return { ok: false, reason: "importo non valido" };

  const meta = session.metadata ?? {};
  const requestId = Number(meta.requestId);
  const userId = Number(meta.userId);
  const role = String(meta.role ?? "").toUpperCase();
  if (!Number.isInteger(requestId) || !Number.isInteger(userId)) return { ok: false, reason: "metadata incompleti" };

  if (meta.kind === "SELECT_APPLICATION") {
    const applicationId = Number(meta.applicationId);
    if (!Number.isInteger(applicationId)) return { ok: false, reason: "candidatura mancante" };

    const assigned = await prisma.$transaction(async (tx) => {
      const req = await tx.request.findUnique({ where: { id: requestId }, select: { companyId: true } });
      if (!req || req.companyId !== userId) return null;
      const result = await assignInTx(tx, applicationId);
      // Il pagamento si registra comunque: se nel frattempo il candidato si e'
      // ritirato, l'azienda potra' sceglierne un altro senza pagare di nuovo.
      await recordUnlock(tx, requestId, userId, "COMPANY", session);
      return result;
    });
    if (assigned) await afterAssign(applicationId);
    return { ok: true };
  }

  if (role === "TRANSPORTER") {
    const confirmed = await prisma.$transaction(async (tx) => {
      const req = await tx.request.findUnique({
        where: { id: requestId },
        select: { status: true, transporterId: true, selectedApplicationId: true },
      });
      if (!req) return false;
      await recordUnlock(tx, requestId, userId, "TRANSPORTER", session);
      if (req.status !== REQUEST_STATUS.ASSIGNED || req.transporterId !== userId) {
        console.error("[load-flow] pagamento trasportatore su carico non piu' assegnato a lui: da rimborsare", {
          requestId,
          userId,
          session: session.id,
        });
        return false;
      }
      const now = new Date();
      await tx.request.update({
        where: { id: requestId },
        data: {
          status: REQUEST_STATUS.CONFIRMED,
          confirmedAt: now,
          contactsUnlocked: true,
          unlockedByCompany: true,
          unlockedByTransporter: true,
        },
      });
      // Ora il carico e' davvero suo: gli altri candidati vengono chiusi.
      await tx.application.updateMany({
        where: { requestId, status: APPLICATION_STATUS.PENDING },
        data: { status: APPLICATION_STATUS.REJECTED },
      });
      return true;
    });

    if (confirmed) {
      const losers = await prisma.application.findMany({
        where: { requestId, status: APPLICATION_STATUS.REJECTED },
        include: { transporter: { select: personSelect }, request: { select: { id: true, pickup: true, delivery: true } } },
      });
      await Promise.all(losers.map((a) => notifyNotSelected(a.transporter, a.request)));
    }
    return { ok: true };
  }

  // Sessioni del vecchio modello ancora in giro: si registra solo il pagamento.
  if (role === "COMPANY") {
    await prisma.$transaction((tx) => recordUnlock(tx, requestId, userId, "COMPANY", session));
    return { ok: true };
  }

  return { ok: false, reason: "ruolo non valido" };
}

/**
 * Riporta il carico in stato aperto liberando il trasportatore scelto, che ha
 * rinunciato (DECLINED) o non ha confermato in tempo (RELEASED).
 */
export async function reopenAfterSelection(applicationId: number, outcome: "DECLINED" | "RELEASED") {
  const done = await prisma.$transaction(async (tx) => {
    const app = await tx.application.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true, requestId: true },
    });
    if (!app || app.status !== APPLICATION_STATUS.SELECTED) return false;
    const updated = await tx.request.updateMany({
      where: { id: app.requestId, status: REQUEST_STATUS.ASSIGNED, selectedApplicationId: app.id },
      data: {
        status: REQUEST_STATUS.OPEN,
        transporterId: null,
        selectedApplicationId: null,
        agreedPrice: null,
        assignedAt: null,
        acceptedAt: null,
      },
    });
    if (updated.count === 0) return false;
    await tx.application.update({ where: { id: app.id }, data: { status: outcome } });
    return true;
  });

  if (done) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { request: { select: { id: true, pickup: true, delivery: true, company: { select: personSelect } } } },
    });
    if (app) await notifyReleased(app.request.company, app.request, outcome === "DECLINED" ? "declined" : "expired");
  }
  return done;
}
