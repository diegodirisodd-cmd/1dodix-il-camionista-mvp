// Sigle delle province italiane, usate da Borsa Servizi per il matching
// richiesta ↔ zona servita dal fornitore. Elenco chiuso: la provincia è
// normalizzata in maiuscolo sia lato richiesta sia lato area di copertura.
export const ITALIAN_PROVINCES = [
  "AG", "AL", "AN", "AO", "AP", "AQ", "AR", "AT", "AV",
  "BA", "BG", "BI", "BL", "BN", "BO", "BR", "BS", "BT", "BZ",
  "CA", "CB", "CE", "CH", "CL", "CN", "CO", "CR", "CS", "CT", "CZ",
  "EN", "FC", "FE", "FG", "FI", "FM", "FR",
  "GE", "GO", "GR", "IM", "IS", "KR",
  "LC", "LE", "LI", "LO", "LT", "LU",
  "MB", "MC", "ME", "MI", "MN", "MO", "MS", "MT",
  "NA", "NO", "NU", "OR", "PA", "PC", "PD", "PE", "PG", "PI", "PN", "PO", "PR", "PT", "PU", "PV", "PZ",
  "RA", "RC", "RE", "RG", "RI", "RM", "RN", "RO",
  "SA", "SI", "SO", "SP", "SR", "SS", "SU", "SV",
  "TA", "TE", "TN", "TO", "TP", "TR", "TS", "TV",
  "UD", "VA", "VB", "VC", "VE", "VI", "VR", "VT", "VV",
] as const;

export type ProvinceCode = (typeof ITALIAN_PROVINCES)[number];

export function isProvinceCode(value: unknown): value is ProvinceCode {
  return (
    typeof value === "string" &&
    (ITALIAN_PROVINCES as readonly string[]).includes(value.trim().toUpperCase())
  );
}

export function normalizeProvince(value: string) {
  return value.trim().toUpperCase();
}
