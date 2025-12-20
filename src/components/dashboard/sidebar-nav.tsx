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
    <nav className="space-y-1 text-sm text-neutral-200">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
              "hover:bg-white/5 hover:text-white",
              active ? "bg-white/10 text-white shadow-inner" : "text-neutral-300"
            )}
          >
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
