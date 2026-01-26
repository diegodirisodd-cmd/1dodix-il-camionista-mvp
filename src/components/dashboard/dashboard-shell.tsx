"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { type Role } from "@/lib/roles";
import { hasActiveSubscription } from "@/lib/subscription";

import { SidebarNav, navByRole } from "./sidebar-nav";

type DashboardShellProps = {
  user: {
    email: string;
    role: Role;
    subscriptionActive: boolean;
    onboardingCompleted: boolean;
  };
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navItems = useMemo(() => navByRole[user.role] ?? [], [user.role]);
  const subscriptionActive = hasActiveSubscription(user);

  const pageLabel = useMemo(() => {
    const activeItem = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return activeItem?.label ?? "Panoramica operativa";
  }, [navItems, pathname]);

  return (
    <div className="min-h-screen bg-appBg text-textStrong">
      <div className="border-b border-slate-200 bg-card px-4 py-3 shadow-sm md:hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Area privata</p>
            <p className="text-sm font-semibold text-textStrong">{pageLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-card text-textStrong shadow-sm"
            aria-expanded={mobileOpen}
            aria-label="Apri navigazione"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <SubscriptionBadge active={subscriptionActive} size="sm" role={user.role} />
          <LogoutButton variant="light" />
        </div>
      </div>

      <div className="flex">
        <aside className="hidden h-full w-64 shrink-0 bg-brand px-4 py-6 text-white md:fixed md:inset-y-0 md:block md:px-6">
          <div className="flex h-full flex-col gap-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Area utente</p>
              <p className="text-lg font-semibold leading-tight text-white">{user.email}</p>
              <p className="text-xs text-white/80">Ruolo: {user.role}</p>
              <SubscriptionBadge active={subscriptionActive} size="sm" role={user.role} className="mt-2" />
            </div>

            <SidebarNav role={user.role} />

            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-xs text-white/80 shadow-sm">
              <p className="font-semibold text-white">Supporto</p>
              <p className="mt-1 leading-relaxed">Gestisci profilo, richieste e contatti dalle sezioni dedicate.</p>
            </div>

            <div className="mt-auto flex items-center justify-between text-sm text-white">
              <Link href="/" className="font-semibold text-white transition hover:text-white/80">
                Torna al sito
              </Link>
              <LogoutButton variant="light" />
            </div>
          </div>
        </aside>

        <main className="min-h-screen w-full px-4 pb-24 pt-6 sm:px-6 md:ml-64 md:px-6 md:pb-10 md:pt-8">
          <div className="mx-auto flex max-w-6xl flex-col space-y-6">
            <div className="hidden items-center justify-between rounded-xl border border-slate-200 bg-card px-4 py-3 text-sm text-slate-600 shadow-sm md:flex">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Area privata</p>
                <p className="text-base font-semibold text-textStrong">{pageLabel}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <SubscriptionBadge active={subscriptionActive} size="sm" role={user.role} />
                <LogoutButton variant="light" />
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute right-4 top-4 w-72 rounded-2xl border border-slate-200 bg-card p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Navigazione</p>
              <p className="text-sm font-semibold text-textStrong">{user.email}</p>
              <SubscriptionBadge active={subscriptionActive} size="sm" role={user.role} />
            </div>
            <SidebarNav
              role={user.role}
              onNavigate={() => {
                setMobileOpen(false);
              }}
            />
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav items={navItems} activePath={pathname} />
    </div>
  );
}

function MobileBottomNav({
  items,
  activePath,
}: {
  items: { href: string; label: string }[];
  activePath: string;
}) {
  const visibleItems = items.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-card/95 backdrop-blur shadow-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-3 text-xs font-semibold text-slate-600">
        {visibleItems.map((item) => {
          const active = activePath === item.href || activePath.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-md px-2 py-1 ${
                active ? "text-textStrong" : "text-slate-600 hover:text-textStrong"
              }`}
            >
              <span className="text-[13px] font-semibold leading-tight">{item.label}</span>
              <span
                className={`h-1 w-6 rounded-full transition ${
                  active ? "bg-brand" : "bg-transparent"
                }`}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
