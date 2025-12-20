import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { LogoutButton } from "@/components/logout-button";
import { getSessionUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#0f172a]">
      <aside className="hidden h-full w-64 shrink-0 bg-[#0b3c5d] px-4 py-6 text-white md:fixed md:inset-y-0 md:block md:px-6">
        <div className="flex h-full flex-col gap-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Area utente</p>
            <p className="text-lg font-semibold leading-tight text-white">{user.email}</p>
            <p className="text-xs text-white/80">Ruolo: {user.role}</p>
            <SubscriptionBadge active={user.subscriptionActive} size="sm" className="mt-2 bg-white/10 text-white" />
          </div>

          <SidebarNav variant="dark" />

          <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-xs text-white/80">
            <p className="font-semibold text-white">Supporto</p>
            <p className="mt-1 leading-relaxed">Gestisci profilo, richieste e abbonamento dalle sezioni dedicate.</p>
          </div>

          <div className="mt-auto flex items-center justify-between text-sm text-white">
            <Link href="/" className="font-semibold text-white transition hover:text-accent-300">
              Torna al sito
            </Link>
            <LogoutButton variant="light" />
          </div>
        </div>
      </aside>

      <main className="min-h-screen px-6 py-8 md:ml-64 md:px-6 md:py-8">
        <div className="mx-auto flex max-w-6xl flex-col space-y-6">{children}</div>
      </main>
    </div>
  );
}
