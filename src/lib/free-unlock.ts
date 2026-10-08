import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

// Primo sblocco gratuito: il primo sblocco di ogni partita IVA (azienda che
// sceglie, trasportatore che conferma) non passa da Stripe. Viene registrato in
// RequestUnlock con amountCents = 0 e senza sessione Stripe.
//
// "Il primo" si conta per partita IVA: tutti gli sblocchi, gratuiti o pagati,
// di qualsiasi account con la stessa P.IVA la consumano. Se la P.IVA manca o
// non e' plausibile si conta per account.

type Tx = Prisma.TransactionClient;
// Il client normale e' assegnabile a TransactionClient: una sola firma per entrambi.
type Db = Tx;

/** Partita IVA senza spazi, punti e prefisso IT: "IT 0123.456.789" == "0123456789". */
export function normalizeVat(raw: string | null | undefined): string | null {
  const v = String(raw ?? "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/^IT/, "");
  // Meno di 5 caratteri e' spazzatura ("0", "-", "123"): non deve raggruppare account diversi.
  return v.length >= 5 ? v : null;
}

async function creditUsed(db: Db, userId: number, vat: string | null): Promise<boolean> {
  const own = await db.requestUnlock.findFirst({ where: { userId }, select: { id: true } });
  if (own) return true;
  if (!vat) return false;
  const rows = await db.$queryRaw<Array<{ ok: number }>>`
    SELECT 1 AS ok
    FROM "RequestUnlock" ru
    JOIN "User" u ON u."id" = ru."userId"
    WHERE regexp_replace(regexp_replace(upper(coalesce(u."vatNumber", '')), '[^0-9A-Z]', '', 'g'), '^IT', '') = ${vat}
    LIMIT 1
  `;
  return rows.length > 0;
}

/** Solo per mostrare l'offerta nell'interfaccia: la decisione vera si prende dentro la transazione. */
export async function freeUnlockAvailable(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { vatNumber: true } });
  if (!user) return false;
  return !(await creditUsed(prisma, userId, normalizeVat(user.vatNumber)));
}

/**
 * Da chiamare dentro una transazione prima di registrare uno sblocco gratuito.
 * Blocca (fino a fine transazione) gli altri sblocchi della stessa P.IVA, cosi'
 * due carichi scelti nello stesso istante non usano il gratuito due volte.
 */
export async function claimFreeUnlock(tx: Tx, userId: number): Promise<boolean> {
  const user = await tx.user.findUnique({ where: { id: userId }, select: { vatNumber: true } });
  if (!user) return false;
  const vat = normalizeVat(user.vatNumber);
  const key = vat ? `free-unlock:vat:${vat}` : `free-unlock:user:${userId}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}::text))`;
  return !(await creditUsed(tx, userId, vat));
}
