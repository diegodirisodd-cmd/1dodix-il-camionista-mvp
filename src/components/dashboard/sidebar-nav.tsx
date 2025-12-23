"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type Role = "COMPANY" | "TRANSPORTER" | "ADMIN";

const navByRole: Record<Role, { href: string; label: string }[]> = {
  COMPANY: [
    { href: "/dashboard/company", label: "Dashboard" },
    { href: "/dashboard/company#storico", label: "Le mie richieste" },
    { href: "/dashboard/profile", label: "Profilo" },
  ],
  TRANSPORTER: [
    { href: "/dashboard/transporter", label: "Dashboard" },
    { href: "/dashboard/transporter/requests", label: "Richieste disponibili" },
    { href: "/dashboard/subscription", label: "Abbonamento" },
    { href: "/dashboard/profile", label: "Profilo" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/dashboard/profile", label: "Profilo" },
  ],
};

export function SidebarNav({
  variant = "light",
  role,
}: {
  variant?: "light" | "dark";
  role: Role;
}) {
  const pathname = usePathname();
  const navItems = navByRole[role] ?? [];

  return (
    <nav className={`space-y-1 text-sm ${variant === "dark" ? "text-white/80" : "text-[#0f172a]"}`}>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
              variant === "dark"
                ? "hover:bg-white/10"
                : "hover:bg-slate-100 hover:text-[#0f172a]",
              active
                ? variant === "dark"
                  ? "bg-white/15 text-white shadow-inner"
                  : "bg-slate-100 text-[#0f172a] shadow-inner"
                : undefined
            )}
          >
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
