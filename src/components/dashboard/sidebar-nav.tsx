"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { type Role } from "@/lib/roles";

export const navByRole: Record<Role, { href: string; label: string }[]> = {
  COMPANY: [
    { href: "/dashboard/company", label: "Dashboard" },
    { href: "/dashboard/requests/new", label: "Crea richiesta" },
    { href: "/dashboard/requests", label: "Richieste inviate" },
    { href: "/dashboard/profile", label: "Profilo" },
    { href: "/dashboard/subscription", label: "Abbonamento" },
  ],
  TRANSPORTER: [
    { href: "/dashboard/transporter", label: "Dashboard" },
    { href: "/dashboard/transporter/requests", label: "Richieste disponibili" },
    { href: "/dashboard/profile", label: "Profilo" },
    { href: "/dashboard/subscription", label: "Abbonamento" },
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
    <nav className="space-y-3 text-sm text-[#475569]">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={clsx(
              "flex items-center justify-between rounded-lg px-3 py-3 transition-colors",
              active
                ? "bg-[#e2e8f0] text-[#0f172a] shadow-inner"
                : "text-[#475569] hover:bg-slate-100 hover:text-[#0f172a]",
            )}
          >
            <span className="font-medium text-[#0f172a]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
