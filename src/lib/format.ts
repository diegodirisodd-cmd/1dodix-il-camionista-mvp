// Formattazioni condivise (server e client).

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const euroRound = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function formatEuro(cents: number | null | undefined, opts: { round?: boolean } = {}) {
  if (cents === null || cents === undefined) return "—";
  return (opts.round ? euroRound : euro).format(cents / 100);
}

export function formatDate(iso: string | Date | null | undefined, style: "short" | "long" = "short") {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return style === "long"
    ? d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long" })
    : d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(iso: string | Date) {
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(iso: string | Date, now: Date = new Date()) {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const min = Math.round(diff / 60000);
  if (min < 1) return "adesso";
  if (min < 60) return `${min} min fa`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ${h === 1 ? "ora" : "ore"} fa`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? "giorno" : "giorni"} fa`;
}

export function euroPerKm(priceCents: number | null | undefined, km: number | null | undefined) {
  if (!priceCents || !km || km <= 0) return null;
  return (priceCents / 100 / km).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
