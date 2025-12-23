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

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#0f172a]">
      <aside className="hidden h-full w-64 shrink-0 bg-[#f8fafc] px-4 py-6 text-[#0f172a] md:fixed md:inset-y-0 md:block md:px-6">
        <div className="flex h-full flex-col gap-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Area utente</p>
            <p className="text-lg font-semibold leading-tight text-[#0f172a]">{user.email}</p>
            <p className="text-xs text-[#475569]">Ruolo: {user.role}</p>
            <SubscriptionBadge active={user.subscriptionActive} size="sm" className="mt-2" />
          </div>

          <SidebarNav role={user.role} />

          <div className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-3 text-xs text-[#475569] shadow-sm">
            <p className="font-semibold text-[#0f172a]">Supporto</p>
            <p className="mt-1 leading-relaxed">Gestisci profilo, richieste e abbonamento dalle sezioni dedicate.</p>
          </div>

          <div className="mt-auto flex items-center justify-between text-sm text-[#0f172a]">
            <Link href="/" className="font-semibold text-[#0f172a] transition hover:text-[#0b3c5d]">
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
