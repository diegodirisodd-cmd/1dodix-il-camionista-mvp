import { type Role } from "./roles";
import { type UnlockState } from "./unlocks";

type RequestPrivacyShape = {
  companyId: number;
  transporterId: number | null;
};

type SessionUser = {
  id: number;
  role: Role;
};

export type CanViewSensitiveContactsContext = {
  request: RequestPrivacyShape;
  user: SessionUser | null;
  unlockState: UnlockState;
};

/**
 * Decide se l'utente può vedere i contatti sensibili (referente ritiro)
 * di una richiesta di trasporto.
 *
 * Regole:
 * - ADMIN: sempre
 * - COMPANY proprietaria della richiesta: sempre (sono i suoi stessi dati)
 * - TRANSPORTER assegnato + entrambe le parti hanno pagato la commissione: sì
 * - Tutti gli altri casi (incluso transporter assegnato che ha pagato solo lui): no
 */
export function canViewSensitiveContacts({
  request,
  user,
  unlockState,
}: CanViewSensitiveContactsContext): boolean {
  if (!user) return false;

  if (user.role === "ADMIN") return true;

  if (user.role === "COMPANY" && request.companyId === user.id) return true;

  if (
    user.role === "TRANSPORTER" &&
    request.transporterId === user.id &&
    unlockState.bothUnlocked &&
    unlockState.unlockedByMe
  ) {
    return true;
  }

  return false;
}

type SanitizableRequest = RequestPrivacyShape & {
  pickupContact?: string | null;
  pickupPhone?: string | null;
};

/**
 * Maschera i campi `pickupContact` e `pickupPhone` se l'utente non è
 * autorizzato a vederli. Restituisce un nuovo oggetto, non muta l'input.
 */
export function sanitizeSensitiveContacts<T extends SanitizableRequest>(
  request: T,
  user: SessionUser | null,
  unlockState: UnlockState,
): T {
  if (canViewSensitiveContacts({ request, user, unlockState })) {
    return request;
  }
  return {
    ...request,
    pickupContact: null,
    pickupPhone: null,
  };
}
