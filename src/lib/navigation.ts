import { type Role } from "./roles";

type RouteUser = {
  role: Role;
  onboardingCompleted: boolean;
};

export function getDashboardPath(role: Role) {
  if (role === "COMPANY") return "/app/company";
  if (role === "TRANSPORTER") return "/app/transporter";
  return "/app/admin";
}

export function routeForUser(user: RouteUser | null | undefined) {
  if (!user) return "/login";
  if (!user.onboardingCompleted) return "/onboarding";
  return getDashboardPath(user.role);
}
