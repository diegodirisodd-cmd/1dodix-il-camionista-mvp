// Campo "Misure / volume" del carico: testo libero (max 100 caratteri).
// - numero nudo ("80", "13,6")            -> "80 m³"
// - misure tutte intere ("120X80X150")    -> "120x80x150 cm"
// - misure con unita' ("120x80x150 CM")   -> "120x80x150 cm"
// - tutto il resto, comprese misure miste come "120X80X1.40" (1.40 e' quasi
//   certamente in metri) -> cosi' com'e', solo con la x minuscola, senza unita'.
const NUM = String.raw`\d+(?:[.,]\d+)?`;
const BARE_NUMBER = new RegExp(`^${NUM}$`);
const INT_DIMS = /^\d+(?:x\d+){1,2}$/;
const DIMS_WITH_UNIT = new RegExp(String.raw`^(${NUM}(?:x${NUM}){1,2})\s*(cm|mm|m)$`, "i");

export function formatVolume(raw: unknown): string | null {
  const s = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!s) return null;
  if (BARE_NUMBER.test(s)) return `${s} m³`;
  // "120X80X150" -> "120x80x150", anche dentro un testo piu' lungo.
  const v = s.replace(/(\d)\s*[x×]\s*(?=\d)/gi, "$1x");
  if (INT_DIMS.test(v)) return `${v} cm`;
  const withUnit = v.match(DIMS_WITH_UNIT);
  if (withUnit) return `${withUnit[1]} ${withUnit[2].toLowerCase()}`;
  return v;
}
