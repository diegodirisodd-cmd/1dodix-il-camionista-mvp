import "server-only";

/**
 * Verifica una partita IVA italiana sul servizio VIES della Commissione
 * europea. Ritorna null se il servizio non risponde (non e' un "no").
 */
export async function checkItalianVat(raw: string): Promise<{ valid: boolean; name: string | null } | null> {
  const number = raw.replace(/^IT/i, "").replace(/\D/g, "");
  if (number.length !== 11) return { valid: false, name: null };
  try {
    const res = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/IT/vat/${number}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { isValid?: boolean; name?: string; userError?: string };
    if (data.userError && data.userError !== "VALID" && data.userError !== "INVALID") return null;
    return { valid: Boolean(data.isValid), name: data.name && data.name !== "---" ? data.name : null };
  } catch {
    return null;
  }
}

/** Telefono in formato +39XXXXXXXXXX (lo stesso usato dagli avvisi WhatsApp). */
export function normalizeItalianPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("00")) d = "+" + d.slice(2);
  if (d.startsWith("+")) return d.length >= 9 ? d : null;
  if (d.startsWith("39") && d.length >= 11) return "+" + d;
  return d.length >= 8 ? "+39" + d : null;
}
