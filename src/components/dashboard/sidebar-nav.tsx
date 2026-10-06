"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { type Role } from "@/lib/roles";

export const navByRole: Record<Role, { href: string; label: string; short?: string }[]> = {
  COMPANY: [
    { href: "/dashboard/company", label: "Panoramica", short: "Home" },
    { href: "/dashboard/company/new-request", label: "Nuovo carico", short: "Nuovo" },
    { href: "/dashboard/company/requests", label: "I miei carichi", short: "Carichi" },
    { href: "/dashboard/services", label: "Borsa Servizi", short: "Servizi" },
    { href: "/dashboard/company/profile", label: "Profilo", short: "Profilo" },
  ],
  TRANSPORTER: [
    { href: "/dashboard/transporter", label: "Panoramica", short: "Home" },
    { href: "/dashboard/transporter/jobs", label: "Bacheca carichi", short: "Bacheca" },
    { href: "/dashboard/transporter/accepted", label: "I miei carichi", short: "Miei" },
    { href: "/dashboard/services", label: "Borsa Servizi", short: "Servizi" },
    { href: "/dashboard/transporter/profile", label: "Profilo", short: "Profilo" },
  ],
  SUPPLIER: [
    { href: "/dashboard/supplier", label: "Panoramica", short: "Home" },
    { href: "/dashboard/services", label: "Richieste disponibili", short: "Richieste" },
    { href: "/dashboard/supplier/profile", label: "Profilo e zone servite", short: "Profilo" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Panoramica operativa", short: "Admin" },
    { href: "/dashboard/profile", label: "Profilo", short: "Profilo" },
  ],
};

export function SidebarNav({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navItems = navByRole[role] ?? [];

  return (
    <nav className="space-y-3 text-sm text-white/80">
      {navItems.map((item) => {
        const isRoot = /^\/dashboard\/(company|transporter|supplier|admin)$/.test(item.href);
        const active = pathname === item.href || (!isRoot && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={clsx(
              "flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-150",
              active
                ? "bg-white/10 text-white shadow-glow ring-1 ring-accent-500/40"
                : "text-white/80 hover:bg-white/5 hover:text-white",
            )}
          >
            <span className="font-medium text-white">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
