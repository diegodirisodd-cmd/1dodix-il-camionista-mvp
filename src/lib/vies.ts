import "server-only";

/**
 * Controllo formale di una partita IVA italiana: 11 cifre e cifra di controllo
 * giusta. Non dice se la ditta esiste, ma scarta errori di battitura e numeri
 * inventati ("12345678901") prima di VIES o della visura.
 */
export function isValidItalianVatFormat(raw: string | null | undefined): boolean {
  const number = String(raw ?? "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/^IT/, "");
  if (!/^\d{11}$/.test(number) || /^0{11}$/.test(number)) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const d = Number(number[i]);
    if (i % 2 === 0) sum += d;
    else sum += d * 2 > 9 ? d * 2 - 9 : d * 2;
  }
  return (10 - (sum % 10)) % 10 === Number(number[10]);
}

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
