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
    <div className="grid min-h-screen grid-cols-1 bg-slate-50 text-slate-900 md:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-slate-200 bg-white px-4 py-6 md:block md:w-64 md:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Area utente</p>
            <p className="text-lg font-semibold leading-tight text-slate-900">{user.email}</p>
            <p className="text-xs text-slate-600">Ruolo: {user.role}</p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} size="sm" />
        </div>

        <div className="mt-8">
          <SidebarNav />
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Supporto</p>
          <p className="mt-1 text-slate-600">Gestisci il tuo profilo, richieste e abbonamento dalle sezioni dedicate.</p>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-700">
          <Link href="/" className="font-semibold text-slate-900 hover:text-blue-700">
            Torna al sito
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto flex max-w-6xl flex-col space-y-6">{children}</div>
      </main>
    </div>
  );
}
