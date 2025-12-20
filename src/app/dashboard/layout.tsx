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
    <div className="grid min-h-screen grid-cols-1 bg-neutral-950 text-white lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/5 bg-neutral-900/60 px-4 py-6 backdrop-blur lg:border-r lg:border-b-0 lg:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-accent-300">Area utente</p>
            <p className="text-lg font-semibold leading-tight">{user.email}</p>
            <p className="text-xs text-neutral-300">Ruolo: {user.role}</p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} size="sm" />
        </div>

        <div className="mt-8">
          <SidebarNav />
        </div>

        <div className="mt-8 rounded-lg border border-white/5 bg-white/5 px-3 py-3 text-xs text-neutral-200">
          <p className="font-semibold text-white">Supporto</p>
          <p className="mt-1 text-neutral-300">Gestisci il tuo profilo, richieste e abbonamento dalle sezioni dedicate.</p>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-neutral-200">
          <Link href="/" className="font-semibold text-white hover:text-accent-200">
            Torna al sito
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 px-4 py-8 lg:px-10">
        <div className="mx-auto max-w-5xl space-y-8">{children}</div>
      </main>
    </div>
  );
}
