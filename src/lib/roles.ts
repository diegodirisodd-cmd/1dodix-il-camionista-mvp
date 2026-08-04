export type Role = "COMPANY" | "TRANSPORTER" | "SUPPLIER" | "ADMIN";

export const ROLE_VALUES: Role[] = ["COMPANY", "TRANSPORTER", "SUPPLIER", "ADMIN"];
export const REGISTRABLE_ROLES: Role[] = ["COMPANY", "TRANSPORTER", "SUPPLIER"];

// Borsa Servizi: ruoli che possono pubblicare una richiesta di servizio e
// gestirla come proprietari (confrontare preventivi, assegnare, chiudere).
// I fornitori rispondono, gli admin osservano soltanto.
export const SERVICE_REQUESTER_ROLES: Role[] = ["TRANSPORTER", "COMPANY"];

export function canRequestServices(role: string) {
  return (SERVICE_REQUESTER_ROLES as string[]).includes(role);
}
