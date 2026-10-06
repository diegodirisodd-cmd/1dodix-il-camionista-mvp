import "server-only";

import type Stripe from "stripe";
import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";
import { APPLICATION_STATUS, REQUEST_STATUS, effectivePriceCents } from "./request-flow";
import { notifyConfirmedToCompany, notifyNotSelected, notifyReleased, notifySelected } from "./load-notifications";

// Operazioni di stato del flusso carichi che toccano piu' tabelle insieme.
// Tutte idempotenti: webhook Stripe e pagina di conferma possono chiamarle
// entrambe per lo stesso pagamento senza effetti doppi.

type Tx = Prisma.TransactionClient;

export function displayName(
  u: {
    companyName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
  },
  fallback?: string,
) {
  return (
    u.companyName?.trim() ||
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    fallback ||
    (u.role === "COMPANY" ? "Azienda DodiX" : "Trasportatore DodiX")
  );
}

const personSelect = { email: true, firstName: true, companyName: true } as const;

/**
 * Assegna il carico al candidato scelto. Va chiamata solo quando l'azienda ha
 * gia' pagato (adesso o in passato per lo stesso carico). Se expectedPriceCents
 * e' indicato, assegna solo se il prezzo della candidatura non e' cambiato nel
 * frattempo (la commissione e' stata calcolata su quel prezzo).
 * Ritorna true se l'assegnazione e' avvenuta in questa chiamata.
 */
async function assignInTx(tx: Tx, applicationId: number, expectedPriceCents?: number | null): Promise<boolean> {
  const app = await tx.application.findUnique({
    where: { id: applicationId },
    include: { request: { select: { id: true, status: true, price: true } } },
  });
  if (!app) return false;
  if (app.request.status !== REQUEST_STATUS.OPEN || app.status !== APPLICATION_STATUS.PENDING) return false;
  const price = effectivePriceCents(app.request.price, app.priceCents);
  if (expectedPriceCents !== undefined && expectedPriceCents !== null && expectedPriceCents !== price) return false;

  const now = new Date();
  // Aggiornamenti condizionati: se due operazioni corrono insieme (ritiro
  // della candidatura, doppio click, webhook + pagina di conferma) ne passa una.
  const selected = await tx.application.updateMany({
    where: { id: app.id, status: APPLICATION_STATUS.PENDING },
    data: { status: APPLICATION_STATUS.SELECTED, selectedAt: now },
  });
  if (selected.count === 0) return false;

  const updated = await tx.request.updateMany({
    where: { id: app.requestId, status: REQUEST_STATUS.OPEN },
    data: {
      status: REQUEST_STATUS.ASSIGNED,
      transporterId: app.transporterId,
      selectedApplicationId: app.id,
      agreedPrice: price,
      assignedAt: now,
      acceptedAt: now,
    },
  });
  if (updated.count === 0) {
    await tx.application.update({
      where: { id: app.id },
      data: { status: APPLICATION_STATUS.PENDING, selectedAt: null },
    });
    return false;
  }
  // Gli altri candidati restano "in valutazione" finche' il carico non e'
  // confermato: se lo scelto rinuncia, l'azienda puo' sceglierne un altro.
  return true;
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
  const ok = await prisma.$transaction((tx) => assignInTx(tx, applicationId));
  if (ok) await afterAssign(applicationId);
  return ok;
}

function paymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
}

/**
 * Registra il pagamento. "created": nuovo; "same": stessa sessione gia'
 * registrata (webhook e pagina di conferma); "duplicate": l'utente aveva gia'
 * pagato con un'altra sessione, quindi questo pagamento va rimborsato.
 */
async function recordUnlock(
  tx: Tx,
  requestId: number,
  userId: number,
  role: "COMPANY" | "TRANSPORTER",
  session: Stripe.Checkout.Session,
): Promise<"created" | "same" | "duplicate"> {
  const existing = await tx.requestUnlock.findUnique({
    where: { requestId_userId: { requestId, userId } },
    select: { stripeSessionId: true },
  });
  if (existing) return existing.stripeSessionId === session.id ? "same" : "duplicate";
  await tx.requestUnlock.create({
    data: {
      requestId,
      userId,
      userRole: role,
      amountCents: session.amount_total ?? null,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId(session),
    },
  });
  return "created";
}

/** Rimborsa un pagamento che non ha prodotto nulla (doppio, tardivo, carico cambiato). */
async function refund(session: Stripe.Checkout.Session, reason: string): Promise<boolean> {
  const pi = paymentIntentId(session);
  console.warn("[load-flow] rimborso", { session: session.id, reason });
  if (!pi || !process.env.STRIPE_SECRET_KEY) return false;
  try {
    const { default: StripeCtor } = await import("stripe");
    const stripe = new StripeCtor(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    await stripe.refunds.create(
      { payment_intent: pi, reason: "requested_by_customer", metadata: { dodix_reason: reason } },
      { idempotencyKey: `dodix-refund-${pi}` },
    );
    return true;
  } catch (e) {
    console.error("[load-flow] rimborso NON riuscito", { session: session.id, pi, e });
    return false;
  }
}

const REFUND_PENDING =
  "Il rimborso non è ancora partito: riproviamo in automatico. Se entro 24 ore non lo vedi, scrivici.";

/** Esito di un pagamento da rimborsare: se il rimborso fallisce, ok=false cosi' Stripe ritenta il webhook. */
async function refundOutcome(session: Stripe.Checkout.Session, internalReason: string, userMessage: string): Promise<CheckoutOutcome> {
  const done = await refund(session, internalReason);
  return done
    ? { ok: true, applied: false, refunded: true, reason: userMessage }
    : { ok: false, applied: false, refunded: false, reason: REFUND_PENDING };
}

/**
 * Blocca la riga del carico fino a fine transazione: webhook Stripe e pagina
 * di conferma arrivano quasi insieme per la stessa sessione e devono essere
 * applicati uno dopo l'altro, non in parallelo.
 */
async function lockRequest(tx: Tx, requestId: number) {
  await tx.$queryRaw`SELECT "id" FROM "Request" WHERE "id" = ${requestId} FOR UPDATE`;
}

export type CheckoutOutcome = { ok: boolean; applied: boolean; refunded?: boolean; reason?: string };

/**
 * Applica un checkout Stripe pagato per un carico.
 * - kind SELECT_APPLICATION: l'azienda sceglie un candidato e paga.
 * - ruolo TRANSPORTER: il trasportatore scelto conferma pagando.
 * Idempotente: puo' essere chiamata piu' volte per la stessa sessione.
 */
export async function applyLoadCheckout(session: Stripe.Checkout.Session): Promise<CheckoutOutcome> {
  if (session.payment_status !== "paid") return { ok: false, applied: false, reason: "non pagato" };
  if (!session.amount_total || session.amount_total <= 0) return { ok: false, applied: false, reason: "importo non valido" };

  const meta = session.metadata ?? {};
  const requestId = Number(meta.requestId);
  const userId = Number(meta.userId);
  const role = String(meta.role ?? "").toUpperCase();
  if (!Number.isInteger(requestId) || !Number.isInteger(userId)) {
    return { ok: false, applied: false, reason: "metadata incompleti" };
  }

  if (meta.kind === "SELECT_APPLICATION") {
    const applicationId = Number(meta.applicationId);
    const expectedPrice = meta.priceCents ? Number(meta.priceCents) : null;
    if (!Number.isInteger(applicationId)) return { ok: false, applied: false, reason: "candidatura mancante" };

    const result = await prisma.$transaction(async (tx) => {
      await lockRequest(tx, requestId);
      const req = await tx.request.findUnique({ where: { id: requestId }, select: { companyId: true } });
      if (!req || req.companyId !== userId) return { recorded: "duplicate" as const, assigned: false };
      const recorded = await recordUnlock(tx, requestId, userId, "COMPANY", session);
      if (recorded === "duplicate") return { recorded, assigned: false };
      const assigned = await assignInTx(tx, applicationId, expectedPrice);
      return { recorded, assigned };
    });

    if (result.recorded === "duplicate") {
      return refundOutcome(
        session,
        "commissione azienda gia' pagata per questo carico",
        "Avevi già pagato la commissione per questo carico: questo pagamento ti viene rimborsato.",
      );
    }
    if (result.assigned) await afterAssign(applicationId);
    if (!result.assigned && result.recorded === "created") {
      // Pagato ma il candidato non era piu' disponibile (ritirato, prezzo
      // cambiato, carico gia' assegnato): il pagamento resta valido per
      // scegliere un altro candidato senza pagare di nuovo.
      return { ok: true, applied: false, reason: "Il candidato non è più disponibile alle stesse condizioni. La commissione resta valida: puoi scegliere un altro candidato senza pagare di nuovo." };
    }
    return { ok: true, applied: true };
  }

  if (role === "TRANSPORTER") {
    const result = await prisma.$transaction(async (tx) => {
      await lockRequest(tx, requestId);
      const existing = await tx.requestUnlock.findUnique({
        where: { requestId_userId: { requestId, userId } },
        select: { stripeSessionId: true },
      });
      if (existing && existing.stripeSessionId !== session.id) return "duplicate";

      const now = new Date();
      const updated = await tx.request.updateMany({
        where: { id: requestId, status: REQUEST_STATUS.ASSIGNED, transporterId: userId },
        data: {
          status: REQUEST_STATUS.CONFIRMED,
          confirmedAt: now,
          contactsUnlocked: true,
          unlockedByCompany: true,
          unlockedByTransporter: true,
        },
      });
      // Gia' registrato con questa sessione: conferma gia' applicata.
      if (updated.count === 0 && existing) return "same";
      // Il carico non e' (piu') assegnato a lui: nessun contatto, rimborso.
      if (updated.count === 0) return "stale";

      if (!existing) await recordUnlock(tx, requestId, userId, "TRANSPORTER", session);
      await tx.application.updateMany({
        where: { requestId, status: APPLICATION_STATUS.PENDING },
        data: { status: APPLICATION_STATUS.REJECTED },
      });
      return "confirmed";
    });

    if (result === "duplicate" || result === "stale") {
      return refundOutcome(
        session,
        result === "duplicate" ? "conferma gia' pagata" : "carico non piu' assegnato",
        result === "duplicate"
          ? "Avevi già confermato questo carico: questo pagamento ti viene rimborsato."
          : "Il carico non era più assegnato a te quando il pagamento è arrivato: ti viene rimborsato.",
      );
    }

    if (result === "confirmed") {
      const load = await prisma.request.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          pickup: true,
          delivery: true,
          company: { select: personSelect },
          transporter: { select: { ...personSelect, lastName: true, phone: true } },
        },
      });
      const losers = await prisma.application.findMany({
        where: { requestId, status: APPLICATION_STATUS.REJECTED },
        include: { transporter: { select: personSelect } },
      });
      if (load) {
        await Promise.all([
          load.transporter
            ? notifyConfirmedToCompany(load.company, load, displayName(load.transporter), load.transporter.phone, load.transporter.email)
            : Promise.resolve(),
          ...losers.map((a) => notifyNotSelected(a.transporter, load)),
        ]);
      }
    }
    return { ok: true, applied: true };
  }

  // Sessioni del vecchio modello. Se il pagamento e' gia' registrato (era
  // stato usato), nessun effetto; altrimenti non sblocca nulla: rimborso.
  const used = await prisma.requestUnlock.findFirst({ where: { stripeSessionId: session.id }, select: { id: true } });
  if (used) return { ok: true, applied: true };
  return refundOutcome(session, "checkout del vecchio modello", "Pagamento non più necessario: ti viene rimborsato.");
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
