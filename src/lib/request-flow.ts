// Regole del ciclo di vita di un carico e delle candidature.
//
// Modulo puro, senza import: compilato da solo nei test
// (scripts/test-request-flow.cjs), come request-privacy.ts.

export const REQUEST_STATUS = {
  OPEN: "OPEN", // pubblicato, accetta candidature
  ASSIGNED: "ASSIGNED", // l'azienda ha scelto e pagato, attende il trasportatore
  CONFIRMED: "CONFIRMED", // hanno pagato entrambi: contatti visibili
  DELIVERED: "DELIVERED", // trasporto eseguito
  CANCELLED: "CANCELLED",
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export const APPLICATION_STATUS = {
  PENDING: "PENDING",
  SELECTED: "SELECTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
  DECLINED: "DECLINED",
  RELEASED: "RELEASED",
} as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

/** Ore entro cui il trasportatore scelto deve confermare pagando. */
export const CONFIRM_WINDOW_HOURS = 24;

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  OPEN: "Aperto",
  ASSIGNED: "In attesa di conferma",
  CONFIRMED: "Confermato",
  DELIVERED: "Consegnato",
  CANCELLED: "Annullato",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "In valutazione",
  SELECTED: "Scelto",
  REJECTED: "Non scelto",
  WITHDRAWN: "Ritirata",
  DECLINED: "Hai rinunciato",
  RELEASED: "Scaduta",
};

/** Un carico e' scaduto se la data di ritiro e' passata da piu' di un giorno. */
export function isPickupPast(pickupDate: Date | string | null | undefined, now: Date = new Date()) {
  if (!pickupDate) return false;
  const d = new Date(pickupDate);
  if (Number.isNaN(d.getTime())) return false;
  const endOfPickupDay = new Date(d);
  endOfPickupDay.setHours(23, 59, 59, 999);
  return endOfPickupDay.getTime() + 24 * 3600 * 1000 < now.getTime();
}

export function canApply(
  request: { status: string; pickupDate?: Date | string | null },
  now: Date = new Date(),
) {
  return request.status === REQUEST_STATUS.OPEN && !isPickupPast(request.pickupDate, now);
}

/** Il trasportatore scelto puo' essere sostituito dopo la finestra di conferma. */
export function canRelease(selectedAt: Date | string | null | undefined, now: Date = new Date()) {
  if (!selectedAt) return false;
  const t = new Date(selectedAt).getTime();
  return Number.isFinite(t) && now.getTime() - t >= CONFIRM_WINDOW_HOURS * 3600 * 1000;
}

/** Prezzo su cui si calcola la commissione: quello proposto dal candidato o quello del carico. */
export function effectivePriceCents(requestPrice: number, applicationPrice?: number | null) {
  return applicationPrice && applicationPrice > 0 ? applicationPrice : requestPrice;
}

const PHONE_RE = /(\+?\d[\d\s.\-/()]{6,}\d)/g;
const EMAIL_RE = /[A-Z0-9._%+-]+\s*(@|\(at\)|\[at\]| at )\s*[A-Z0-9.-]+\s*(\.|\(dot\)| dot )\s*[A-Z]{2,}/gi;
const LINK_RE = /\b(wa\.me|whatsapp\.com|t\.me|telegram\.me)\/\S*/gi;

/**
 * Oscura telefoni, email e link di messaggistica in un messaggio di chat.
 * Si applica finche' i contatti non sono stati sbloccati da entrambi:
 * altrimenti la chat diventerebbe il modo per saltare il pagamento.
 */
export function maskContacts(text: string): { text: string; masked: boolean } {
  let masked = false;
  const replace = (re: RegExp, label: string) => (input: string) =>
    input.replace(re, (match) => {
      // Non oscurare numeri brevi come prezzi o pesi ("1.200", "33 pallet").
      if (label === "telefono" && match.replace(/\D/g, "").length < 8) return match;
      masked = true;
      return `[${label} visibile dopo la conferma]`;
    });
  let out = text;
  out = replace(EMAIL_RE, "email")(out);
  out = replace(LINK_RE, "link")(out);
  out = replace(PHONE_RE, "telefono")(out);
  return { text: out, masked };
}
