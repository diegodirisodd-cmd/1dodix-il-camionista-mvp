import { Suspense } from "react";

import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    // Protezione difensiva: il middleware dovrebbe già bloccare l'accesso.
    redirect("/login");
  }

  if (!user.subscriptionActive) {
    redirect("/paywall");
  }

  const isAdmin = user.role === "ADMIN";
  const adminStats = isAdmin
    ? await Promise.all([
        prisma.user.count(),
        prisma.request.count(),
      ])
    : null;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Profilo</p>
        <h1>Area account</h1>
        <p className="text-neutral-100/80">
          Accesso verificato per {user.email}. Le funzioni operative richiedono un abbonamento attivo.
        </p>
      </div>

      <div className="card space-y-6 text-sm text-neutral-100/80">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Ruolo</p>
            <p className="text-base font-semibold text-white">{user.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Creato il</p>
            <p className="text-base font-semibold text-white">{new Date(user.createdAt).toLocaleString("it-IT")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Stato abbonamento</p>
            <p className="text-base font-semibold text-white">{user.subscriptionActive ? "Attivo" : "Non attivo"}</p>
          </div>
        </div>

        {isAdmin && adminStats && (
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Utenti totali</p>
              <p className="text-3xl font-semibold text-white">{adminStats[0]}</p>
              <p className="text-xs text-neutral-300">Visibili in sola lettura per supervisione.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Richieste registrate</p>
              <p className="text-3xl font-semibold text-white">{adminStats[1]}</p>
              <p className="text-xs text-neutral-300">Consultazione completa, nessuna azione di modifica.</p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Suspense fallback={<p>Chiusura sessione...</p>}>
            <LogoutButton />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
