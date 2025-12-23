"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type Role = "COMPANY" | "TRANSPORTER" | "ADMIN";

const navByRole: Record<Role, { href: string; label: string }[]> = {
  COMPANY: [
    { href: "/dashboard/company", label: "Panoramica operativa" },
    { href: "/dashboard/company#storico", label: "Le mie richieste" },
    { href: "/dashboard/profile", label: "Profilo" },
  ],
  TRANSPORTER: [
    { href: "/dashboard/transporter", label: "Panoramica operativa" },
    { href: "/dashboard/transporter/requests", label: "Richieste disponibili" },
    { href: "/dashboard/subscription", label: "Abbonamento" },
    { href: "/dashboard/profile", label: "Profilo" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Panoramica operativa" },
    { href: "/dashboard/profile", label: "Profilo" },
  ],
};

export function SidebarNav({
  role,
}: {
  role: Role;
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
            className={clsx(
              "flex items-center justify-between rounded-lg px-3 py-3 transition-colors",
              active
                ? "bg-[#e2e8f0] text-[#0f172a] shadow-inner"
                : "text-[#475569] hover:bg-slate-100 hover:text-[#0f172a]"
            )}
          >
            <span className="font-medium text-[#0f172a]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
