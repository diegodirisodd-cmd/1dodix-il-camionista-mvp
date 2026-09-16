// Regole di visibilità dei contatti su una richiesta di trasporto.
//
// Nessun import: il modulo è puro e viene compilato da solo in
// scripts/test-request-privacy.cjs, come già accade per whatsapp-webhook.ts.

export type RequestUnlockState = {
  unlockedByMe: boolean;
  unlockedByOther: boolean;
  bothUnlocked: boolean;
};

export type ContactViewer = {
  id: number;
  role: string;
} | null;

export type RequestContactFields = {
  companyId: number;
  company?: { email?: string | null; phone?: string | null } | null;
  pickupContact?: string | null;
  pickupPhone?: string | null;
};

const EMPTY_STATE: RequestUnlockState = {
  unlockedByMe: false,
  unlockedByOther: false,
  bothUnlocked: false,
};

/**
 * Where clause della lista richieste, per ruolo.
 *
 * - COMPANY: solo le proprie richieste.
 * - TRANSPORTER: la bacheca mostra solo carichi ancora liberi, mai quelli già
 *   assegnati, completati o annullati. COMPANY_PAID resta visibile: è un
 *   carico senza trasportatore su cui l'azienda ha già pagato la commissione.
 * - ADMIN (o altro): nessun filtro.
 */
export const TRANSPORTER_BOARD_STATUSES = ["OPEN", "COMPANY_PAID"];

export function requestsWhereClauseForRole(role: string, userId: number) {
  if (role === "COMPANY") {
    return { companyId: userId };
  }
  if (role === "TRANSPORTER") {
    return { transporterId: null, status: { in: TRANSPORTER_BOARD_STATUSES } };
  }
  return undefined;
}

/**
 * I contatti dell'azienda (email, telefono, referente al ritiro) sono
 * visibili solo a chi li ha sbloccati, al proprietario del carico e agli admin.
 */
export function canViewRequestContacts(
  request: { companyId: number },
  viewer: ContactViewer,
  unlockedForCurrentUser: boolean,
): boolean {
  if (!viewer) return false;
  if (viewer.role === "ADMIN") return true;
  if (request.companyId === viewer.id) return true;
  return unlockedForCurrentUser;
}

/**
 * Azzera i contatti sensibili quando il viewer non è autorizzato a vederli.
 * Restituisce un nuovo oggetto, non muta l'input, e tocca solo le chiavi
 * effettivamente presenti nella riga selezionata.
 */
export function redactRequestContacts<T extends RequestContactFields>(
  request: T,
  viewer: ContactViewer,
  unlockedForCurrentUser: boolean,
): T {
  if (canViewRequestContacts(request, viewer, unlockedForCurrentUser)) {
    return request;
  }

  const redacted: Record<string, unknown> = { ...request };

  const company = redacted.company;
  if (company && typeof company === "object") {
    redacted.company = {
      ...(company as Record<string, unknown>),
      email: null,
      phone: null,
    };
  }

  if ("pickupContact" in redacted) redacted.pickupContact = null;
  if ("pickupPhone" in redacted) redacted.pickupPhone = null;

  return redacted as T;
}

/**
 * Costruisce il payload JSON di GET /api/requests: stato di sblocco per riga
 * e contatti già ripuliti, così la redazione non può essere dimenticata a valle.
 */
export function buildRequestsListPayload<T extends RequestContactFields & { id: number }>(
  requests: T[],
  unlockStates: Map<number, RequestUnlockState>,
  viewer: ContactViewer,
) {
  return requests.map((request) => {
    const state = unlockStates.get(request.id) ?? EMPTY_STATE;
    return {
      ...redactRequestContacts(request, viewer, state.unlockedByMe),
      unlockedForCurrentUser: state.unlockedByMe,
      unlockedByOtherParty: state.unlockedByOther,
      bothPartiesUnlocked: state.bothUnlocked,
    };
  });
}
