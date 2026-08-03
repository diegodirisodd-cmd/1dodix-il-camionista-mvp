"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { type Role } from "@/lib/roles";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { hasActiveSubscription } from "@/lib/subscription";

type NavItem = { href: string; label: string };

const navByRole: Record<Role, NavItem[]> = {
  COMPANY: [
    { href: "/app/company", label: "Panoramica operativa" },
    { href: "/app/company/requests", label: "Le mie richieste" },
    { href: "/app/company/profile", label: "Profilo" },
  ],
  TRANSPORTER: [
    { href: "/app/transporter", label: "Panoramica operativa" },
    { href: "/app/transporter/requests", label: "Richieste disponibili" },
  { href: "/app/transporter/subscription", label: "Commissioni" },
    { href: "/app/transporter/profile", label: "Profilo" },
  ],
  SUPPLIER: [
    { href: "/dashboard/supplier", label: "Panoramica fornitore" },
  ],
  ADMIN: [
    { href: "/app/admin", label: "Panoramica operativa" },
  ],
};

export function AppSidebar({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: { email: string; role: Role; subscriptionActive: boolean };
}) {
  const pathname = usePathname();
  const items = useMemo(() => navByRole[user.role] ?? [], [user.role]);
  const subscriptionActive = hasActiveSubscription(user);

  const SidebarContent = (
    <div className="flex h-full flex-col gap-8 px-4 py-6 text-textStrong">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Area utente</p>
        <p className="text-lg font-semibold leading-tight text-textStrong">{user.email}</p>
        <p className="text-xs text-neutral-600">Ruolo: {user.role}</p>
        <SubscriptionBadge active={subscriptionActive} role={user.role as any} className="mt-2" />
      </div>

      <nav className="space-y-2 text-sm text-neutral-600">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                "flex items-center justify-between rounded-lg px-3 py-3 transition-colors",
                active
                  ? "bg-[#e2e8f0] text-textStrong shadow-inner"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-textStrong",
              )}
            >
              <span className="font-medium text-textStrong">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-600 shadow-sm">
        <p className="font-semibold text-textStrong">Supporto</p>
        <p className="mt-1 leading-relaxed">Gestisci profilo, richieste e contatti dalle sezioni dedicate.</p>
      </div>

      <div className="mt-auto space-y-3 text-sm text-neutral-600">
        <Link href="/" className="font-semibold text-textStrong transition hover:text-accent-600">
          Torna al sito
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 bg-neutral-50 text-textStrong shadow-sm md:block">
        {SidebarContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose}>
          <div
            className="relative h-full w-72 max-w-[80%] bg-white text-textStrong shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <p className="text-sm font-semibold text-textStrong">Navigazione</p>
              <button
                onClick={onClose}
                className="rounded-md border border-neutral-200 px-3 py-1 text-xs font-semibold text-textStrong shadow-sm hover:bg-neutral-50"
              >
                Chiudi
              </button>
            </div>
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
