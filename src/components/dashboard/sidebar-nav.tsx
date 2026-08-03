"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { type Role } from "@/lib/roles";

export const navByRole: Record<Role, { href: string; label: string }[]> = {
  COMPANY: [
    { href: "/dashboard/company", label: "Panoramica azienda" },
    { href: "/dashboard/company/requests", label: "Richieste inviate" },
    { href: "/dashboard/company/history", label: "Storico trasporti" },
    { href: "/dashboard/company/profile", label: "Profilo aziendale" },
    { href: "/dashboard/company/billing", label: "Commissioni" },
  ],
  TRANSPORTER: [
    { href: "/dashboard/transporter", label: "Panoramica trasportatore" },
    { href: "/dashboard/transporter/jobs", label: "Richieste disponibili" },
    { href: "/dashboard/transporter/accepted", label: "Trasporti accettati" },
    { href: "/dashboard/services", label: "Borsa Servizi" },
    { href: "/dashboard/transporter/profile", label: "Profilo operatore" },
    { href: "/dashboard/transporter/billing", label: "Commissioni" },
  ],
  SUPPLIER: [
    { href: "/dashboard/supplier", label: "Panoramica fornitore" },
    { href: "/dashboard/services", label: "Richieste disponibili" },
    { href: "/dashboard/supplier/profile", label: "Profilo e zone servite" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Panoramica operativa" },
    { href: "/dashboard/profile", label: "Profilo" },
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
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
