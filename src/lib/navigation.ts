export function getDashboardPath(role: string) {
  if (role === "COMPANY") return "/dashboard/company";
  if (role === "TRANSPORTER") return "/dashboard/transporter";
  return "/dashboard/admin";
}
