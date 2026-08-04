import { type Role } from "./roles";

type RouteUser = {
  role: string;
};

export function getDashboardPath(role: Role) {
  if (role === "COMPANY") return "/dashboard/company";
  if (role === "TRANSPORTER") return "/dashboard/transporter";
  if (role === "SUPPLIER") return "/dashboard/supplier";
  return "/dashboard/admin";
}

export function routeForUser(role: string) {
  if (!role) return "/login";
  return getDashboardPath(role as Role);
}
