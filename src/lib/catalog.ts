// Elenchi condivisi fra server e client: regioni, mezzi, tipi merce,
// modalita' di pagamento. Nessun import, usabile ovunque.

export const REGIONS = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli-Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Trentino-Alto Adige",
  "Umbria",
  "Valle d'Aosta",
  "Veneto",
] as const;

/** I nomi ISTAT bilingui vengono ricondotti al nome italiano. */
export function normalizeRegion(name: string | null | undefined): string | null {
  if (!name) return null;
  if (name.startsWith("Trentino")) return "Trentino-Alto Adige";
  if (name.startsWith("Valle d")) return "Valle d'Aosta";
  return (REGIONS as readonly string[]).includes(name) ? name : null;
}

export const VEHICLE_TYPES: { value: string; label: string }[] = [
  { value: "bilico", label: "Bilico (13,6 m)" },
  { value: "centinato", label: "Centinato / telonato" },
  { value: "frigo", label: "Semirimorchio frigo" },
  { value: "motrice", label: "Motrice" },
  { value: "furgone", label: "Furgone" },
  { value: "furgone_frigo", label: "Furgone frigo" },
  { value: "pianale", label: "Pianale" },
  { value: "cisterna", label: "Cisterna" },
  { value: "ribaltabile", label: "Ribaltabile" },
  { value: "altro", label: "Altro" },
];

export const VEHICLE_LABELS: Record<string, string> = Object.fromEntries(
  VEHICLE_TYPES.map((v) => [v.value, v.label]),
);

export const CARGO_TYPES: { value: string; label: string }[] = [
  { value: "pallet", label: "Pallet" },
  { value: "colli", label: "Colli / pacchi" },
  { value: "sfuso", label: "Sfuso" },
  { value: "container", label: "Container" },
  { value: "frigo", label: "Merce refrigerata" },
  { value: "adr", label: "ADR / merci pericolose" },
  { value: "liquidi", label: "Liquidi / cisterna" },
  { value: "altro", label: "Altro" },
];

export const CARGO_LABELS: Record<string, string> = Object.fromEntries(
  CARGO_TYPES.map((v) => [v.value, v.label]),
);

export const PAYMENT_TERMS: { value: string; label: string }[] = [
  { value: "bonifico_immediato", label: "Bonifico immediato" },
  { value: "bonifico_30", label: "Bonifico 30 giorni" },
  { value: "bonifico_60", label: "Bonifico 60 giorni" },
  { value: "contrassegno", label: "Contrassegno" },
  { value: "altro", label: "Altro (nelle note)" },
];

export const PAYMENT_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_TERMS.map((v) => [v.value, v.label]),
);

export const ROLE_LABELS: Record<string, string> = {
  COMPANY: "Azienda",
  TRANSPORTER: "Trasportatore",
  SUPPLIER: "Fornitore servizi",
  ADMIN: "Amministratore",
};

/**
 * Distanza stradale stimata in km fra due punti: distanza in linea d'aria
 * per un fattore 1,25 (media tipica della rete stradale italiana).
 */
export function estimateRoadKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const air = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round(air * 1.25);
}

export function formatPlace(city: string | null | undefined, province: string | null | undefined, fallback: string) {
  if (!city) return fallback;
  return province ? `${city} (${province})` : city;
}

/** Limiti del prezzo di un trasporto, in euro. */
export const MIN_PRICE_EUR = 50;
export const MAX_PRICE_EUR = 100000;

/**
 * Legge un importo in euro scritto all'italiana o all'inglese:
 * "1.200" -> 1200, "1.200,50" -> 1200.5, "950,50" -> 950.5, "950.50" -> 950.5.
 * Ritorna i centesimi, oppure null se non e' un numero valido.
 */
export function parseEuroToCents(input: unknown): number | null {
  if (typeof input === "number") return Number.isFinite(input) && input > 0 ? Math.round(input * 100) : null;
  if (typeof input !== "string") return null;
  let s = input.replace(/[€\s]/g, "");
  if (!s) return null;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
}

export function priceOutOfRange(cents: number) {
  return cents < MIN_PRICE_EUR * 100 || cents > MAX_PRICE_EUR * 100;
}
