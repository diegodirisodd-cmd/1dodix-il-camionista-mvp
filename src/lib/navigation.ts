import { type Role } from "./roles";

type RouteUser = {
  role: string;
};

export function getDashboardPath(role: Role) {
  if (role === "COMPANY") return "/dashboard/company";
  if (role === "TRANSPORTER") return "/dashboard/transporter";
  return "/dashboard/admin";
}

export function routeForUser(role: string) {
  if (!role) return "/login";
  return getDashboardPath(role as Role);
}
