export type RequestStatus = "OPEN" | "TRANSPORTER_PAID" | "COMPANY_PAID" | "COMPLETED";
export type UserSide = "TRASPORTATORE" | "AZIENDA";

export type PaymentRequestFlags = {
  unlockedByTransporter: boolean;
  unlockedByCompany: boolean;
  contactsUnlocked: boolean;
};

export type PaymentRequest = PaymentRequestFlags & {
  status?: RequestStatus;
};

export function deriveStatusFromUnlockFlags({
  unlockedByTransporter,
  unlockedByCompany,
}: Pick<PaymentRequest, "unlockedByTransporter" | "unlockedByCompany">): RequestStatus {
  if (unlockedByTransporter && unlockedByCompany) {
    return "COMPLETED";
  }

  if (unlockedByTransporter) {
    return "TRANSPORTER_PAID";
  }

  if (unlockedByCompany) {
    return "COMPANY_PAID";
  }

  return "OPEN";
}

export function shouldShowPaymentButton(request: PaymentRequest, side: UserSide): boolean {
  if (side === "TRASPORTATORE") {
    return !request.unlockedByTransporter;
  }

  return !request.unlockedByCompany;
}

export function shouldShowContacts(request: PaymentRequest): boolean {
  return request.contactsUnlocked === true;
}

export function applyPaymentWebhookUpdate(
  request: PaymentRequest,
  side: UserSide,
): PaymentRequest & { status: RequestStatus } {
  const unlockedByTransporter =
    side === "TRASPORTATORE" ? true : request.unlockedByTransporter;
  const unlockedByCompany = side === "AZIENDA" ? true : request.unlockedByCompany;
  const contactsUnlocked = unlockedByTransporter && unlockedByCompany;

  return {
    ...request,
    unlockedByTransporter,
    unlockedByCompany,
    contactsUnlocked,
    status: deriveStatusFromUnlockFlags({
      unlockedByTransporter,
      unlockedByCompany,
    }),
  };
}
