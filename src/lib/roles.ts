export type Role = "COMPANY" | "TRANSPORTER" | "SUPPLIER" | "ADMIN";

export const ROLE_VALUES: Role[] = ["COMPANY", "TRANSPORTER", "SUPPLIER", "ADMIN"];
export const REGISTRABLE_ROLES: Role[] = ["COMPANY", "TRANSPORTER", "SUPPLIER"];

// Borsa Servizi: ruoli che possono pubblicare una richiesta di servizio e
// gestirla come proprietari (confrontare preventivi, assegnare, chiudere).
// I fornitori rispondono, gli admin osservano soltanto.
export const SERVICE_REQUESTER_ROLES: Role[] = ["TRANSPORTER", "COMPANY"];

// Chi puo' pubblicare carichi: le aziende e i trasportatori (questi ultimi
// per affidare a un altro vettore un carico di un loro committente).
export const LOAD_PUBLISHER_ROLES: Role[] = ["COMPANY", "TRANSPORTER"];

export function canPublishLoads(role: string) {
  return (LOAD_PUBLISHER_ROLES as string[]).includes(role);
}

/** Pagina di dettaglio di un carico pubblicato, per chi lo ha pubblicato. */
export function ownLoadPath(role: string, requestId: number) {
  return role === "TRANSPORTER" ? `/dashboard/transporter/my-loads/${requestId}` : `/dashboard/company/requests/${requestId}`;
}

export function canRequestServices(role: string) {
  return (SERVICE_REQUESTER_ROLES as string[]).includes(role);
}
