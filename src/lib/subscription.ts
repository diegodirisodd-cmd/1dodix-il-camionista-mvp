import { type Role } from "./roles";

const BILLING_ENTRY_PATH = "/dashboard/billing";

export function hasActiveSubscription(user?: { subscriptionActive?: boolean | null } | null) {
  return Boolean(user?.subscriptionActive);
}

export function billingPathForRole(_: Role) {
  return BILLING_ENTRY_PATH;
}

export function billingDestinationForRole(role: Role) {
  if (role === "TRANSPORTER") return "/dashboard/transporter/billing";
  if (role === "COMPANY") return "/dashboard/company/billing";
  return "/dashboard/admin";
}
