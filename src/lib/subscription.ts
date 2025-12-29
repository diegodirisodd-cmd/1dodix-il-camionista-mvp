import { type Role } from "./roles";

export function hasActiveSubscription(user?: { subscriptionActive?: boolean | null } | null) {
  return Boolean(user?.subscriptionActive);
}

export function billingPathForRole(role: Role) {
  if (role === "TRANSPORTER") return "/dashboard/transporter/billing";
  if (role === "COMPANY") return "/dashboard/company/billing";
  return "/dashboard/admin";
}
