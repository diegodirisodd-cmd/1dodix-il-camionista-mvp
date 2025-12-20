"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/profile", label: "Profilo" },
  { href: "/dashboard/requests", label: "Richieste" },
  { href: "/dashboard/subscription", label: "Abbonamento" },
  { href: "/dashboard/settings", label: "Impostazioni" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 text-sm text-slate-600">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
              "hover:bg-slate-100 hover:text-slate-900",
              active ? "bg-slate-100 text-slate-900 shadow-inner" : "text-slate-700"
            )}
          >
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
