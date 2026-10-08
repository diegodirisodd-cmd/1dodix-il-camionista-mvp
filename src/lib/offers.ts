import "server-only";

// Solo questi account possono mandare offerte a tutti i trasportatori
// (Di Riso Teloni). Si cambia da env senza toccare il codice.
const DEFAULT_SENDERS = "dirisoteloniitalia@dodiitalia.it";

export function canSendOffers(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.OFFER_SENDER_EMAILS || DEFAULT_SENDERS)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

export const OFFER_LIMITS = { title: 80, body: 600 } as const;
// Anti doppio invio: una sola offerta ogni 10 minuti.
export const OFFER_COOLDOWN_MS = 10 * 60 * 1000;
