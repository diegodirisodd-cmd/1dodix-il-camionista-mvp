"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Panoramica operativa" },
  { href: "/dashboard/profile", label: "Profilo" },
  { href: "/dashboard/requests", label: "Richieste" },
  { href: "/dashboard/subscription", label: "Piano di accesso" },
  { href: "/dashboard/settings", label: "Impostazioni" },
];

export function SidebarNav({ variant = "light" }: { variant?: "light" | "dark" }) {
  const pathname = usePathname();

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
