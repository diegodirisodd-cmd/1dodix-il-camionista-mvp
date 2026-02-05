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
    <div className="flex h-full flex-col gap-8 px-4 py-6 text-[#0f172a]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Area utente</p>
        <p className="text-lg font-semibold leading-tight text-[#0f172a]">{user.email}</p>
        <p className="text-xs text-[#475569]">Ruolo: {user.role}</p>
        <SubscriptionBadge active={subscriptionActive} role={user.role as any} className="mt-2" />
      </div>

      <nav className="space-y-2 text-sm text-[#475569]">
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
                  ? "bg-[#e2e8f0] text-[#0f172a] shadow-inner"
                  : "text-[#475569] hover:bg-slate-100 hover:text-[#0f172a]",
              )}
            >
              <span className="font-medium text-[#0f172a]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-3 text-xs text-[#475569] shadow-sm">
        <p className="font-semibold text-[#0f172a]">Supporto</p>
        <p className="mt-1 leading-relaxed">Gestisci profilo, richieste e contatti dalle sezioni dedicate.</p>
      </div>

      <div className="mt-auto space-y-3 text-sm text-[#475569]">
        <Link href="/" className="font-semibold text-[#0f172a] transition hover:text-[#0b3c5d]">
          Torna al sito
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 bg-[#f8fafc] text-[#0f172a] shadow-sm md:block">
        {SidebarContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose}>
          <div
            className="relative h-full w-72 max-w-[80%] bg-white text-[#0f172a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
              <p className="text-sm font-semibold text-[#0f172a]">Navigazione</p>
              <button
                onClick={onClose}
                className="rounded-md border border-[#e2e8f0] px-3 py-1 text-xs font-semibold text-[#0f172a] shadow-sm hover:bg-slate-50"
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
