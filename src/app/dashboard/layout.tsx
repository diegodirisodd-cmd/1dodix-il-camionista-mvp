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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <aside className="hidden h-full w-64 shrink-0 border-r border-[#e2e8f0] bg-white px-4 py-6 md:fixed md:inset-y-0 md:block md:px-6">
        <div className="flex flex-col gap-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Area utente</p>
            <p className="text-lg font-semibold leading-tight text-slate-900">{user.email}</p>
            <p className="text-xs text-slate-700">Ruolo: {user.role}</p>
            <SubscriptionBadge active={user.subscriptionActive} size="sm" className="mt-2" />
          </div>

          <SidebarNav />

          <div className="rounded-lg border border-[#e2e8f0] bg-slate-50 px-3 py-3 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">Supporto</p>
            <p className="mt-1 text-slate-700 leading-relaxed">Gestisci profilo, richieste e abbonamento dalle sezioni dedicate.</p>
          </div>

          <div className="mt-auto flex items-center justify-between text-sm text-slate-800">
            <Link href="/" className="font-semibold text-slate-900 hover:text-slate-700">
              Torna al sito
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="min-h-screen px-6 py-8 md:ml-64 md:px-6 md:py-8">
        <div className="mx-auto flex max-w-7xl flex-col space-y-6">{children}</div>
      </main>
    </div>
  );
}
