"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { type Role } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/catalog";

import { SidebarNav, navByRole } from "./sidebar-nav";

type DashboardShellProps = {
  user: {
    email: string;
    role: Role;
  };
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navItems = useMemo(() => navByRole[user.role] ?? [], [user.role]);

  const pageLabel = useMemo(() => {
    const activeItem =
      navItems.find((item) => pathname === item.href) ??
      navItems.find((item) => pathname.startsWith(`${item.href}/`) && !/^\/dashboard\/(company|transporter|supplier|admin)$/.test(item.href));
    return activeItem?.label ?? "Area privata";
  }, [navItems, pathname]);

  return (
    <div className="min-h-screen bg-appBg text-textStrong">
      <div className="border-b border-neutral-200 bg-card px-4 py-3 shadow-sm md:hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Area privata</p>
            <p className="text-sm font-semibold text-textStrong">{pageLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 bg-card text-textStrong shadow-sm"
            aria-expanded={mobileOpen}
            aria-label="Apri navigazione"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden h-full w-64 shrink-0 bg-gradient-to-b from-brand-900 via-brand-800 to-brand px-4 py-6 text-white md:fixed md:inset-y-0 md:block md:px-6">
          <div className="flex h-full flex-col gap-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Area utente</p>
              <p className="font-display text-lg font-bold leading-tight text-white">{user.email}</p>
              <p className="text-xs text-neutral-300/80">{ROLE_LABELS[user.role] ?? user.role}</p>
            </div>

            <SidebarNav role={user.role} />

            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-xs text-white/80 shadow-sm">
              <p className="font-semibold text-white">Come funziona</p>
              <p className="mt-1 leading-relaxed">
                Pubblicare e candidarsi è gratis. Dopo la scelta pagano entrambi il 2% + IVA e si scambiano i contatti.
              </p>
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
          <div className="mx-auto flex max-w-6xl animate-fadeIn flex-col space-y-6">
            <div className="hidden items-center justify-between rounded-xl border border-neutral-200 bg-card px-4 py-3 text-sm text-neutral-600 shadow-sm md:flex">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Area privata</p>
                <p className="text-base font-semibold text-textStrong">{pageLabel}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
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
            className="absolute right-4 top-4 w-72 rounded-2xl border border-neutral-200 bg-card p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Navigazione</p>
              <p className="text-sm font-semibold text-textStrong">{user.email}</p>
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
  items: { href: string; label: string; short?: string }[];
  activePath: string;
}) {
  const visibleItems = items.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-card/95 backdrop-blur shadow-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-3 text-xs font-semibold text-neutral-600">
        {visibleItems.map((item) => {
          const isRoot = /^\/dashboard\/(company|transporter|supplier|admin)$/.test(item.href);
          const active = activePath === item.href || (!isRoot && activePath.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-md px-2 py-1 transition-colors duration-150 ${
                active ? "text-textStrong" : "text-neutral-500 hover:text-textStrong"
              }`}
            >
              <span className="text-[13px] font-semibold leading-tight">{item.short ?? item.label}</span>
              <span
                className={`h-1 w-6 rounded-full transition-all duration-200 ${
                  active ? "bg-accent-500" : "bg-transparent"
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
