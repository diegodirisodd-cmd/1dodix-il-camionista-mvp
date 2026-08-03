export type ServiceCategory =
  | "TELONI_RIMORCHI"
  | "OFFICINA_MECCANICA"
  | "GOMMISTA_PESANTI"
  | "SOCCORSO_STRADALE"
  | "CARROZZERIA_INDUSTRIALE"
  | "LAVAGGIO_MEZZI";

export const SERVICE_CATEGORY_VALUES: ServiceCategory[] = [
  "TELONI_RIMORCHI",
  "OFFICINA_MECCANICA",
  "GOMMISTA_PESANTI",
  "SOCCORSO_STRADALE",
  "CARROZZERIA_INDUSTRIALE",
  "LAVAGGIO_MEZZI",
];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  TELONI_RIMORCHI: "Teloni e riparazioni rimorchi",
  OFFICINA_MECCANICA: "Officina meccanica",
  GOMMISTA_PESANTI: "Gommista mezzi pesanti",
  SOCCORSO_STRADALE: "Soccorso stradale",
  CARROZZERIA_INDUSTRIALE: "Carrozzeria industriale",
  LAVAGGIO_MEZZI: "Lavaggio camion e rimorchi",
};

export type UrgencyLevel = "BASSA" | "MEDIA" | "ALTA" | "EMERGENZA";

export const URGENCY_VALUES: UrgencyLevel[] = ["BASSA", "MEDIA", "ALTA", "EMERGENZA"];

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  BASSA: "Bassa",
  MEDIA: "Media",
  ALTA: "Alta",
  EMERGENZA: "Emergenza (fermo mezzo)",
};

export type ServiceRequestStatus =
  | "APERTA"
  | "IN_TRATTATIVA"
  | "ASSEGNATA"
  | "CONCLUSA"
  | "ANNULLATA";

export const SERVICE_REQUEST_STATUS_VALUES: ServiceRequestStatus[] = [
  "APERTA",
  "IN_TRATTATIVA",
  "ASSEGNATA",
  "CONCLUSA",
  "ANNULLATA",
];

export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  APERTA: "Aperta",
  IN_TRATTATIVA: "In trattativa",
  ASSEGNATA: "Assegnata",
  CONCLUSA: "Conclusa",
  ANNULLATA: "Annullata",
};

// Prezzo fisso di sblocco contatto per i fornitori (IVA esclusa), in centesimi.
// Prima versione: importo unico, indipendente dalla categoria. Regolabile qui.
export const SERVICE_CONTACT_UNLOCK_PRICE_CENTS = 900; // 9,00 €

export function isServiceCategory(value: unknown): value is ServiceCategory {
  return typeof value === "string" && (SERVICE_CATEGORY_VALUES as string[]).includes(value);
}

export function isUrgencyLevel(value: unknown): value is UrgencyLevel {
  return typeof value === "string" && (URGENCY_VALUES as string[]).includes(value);
}
