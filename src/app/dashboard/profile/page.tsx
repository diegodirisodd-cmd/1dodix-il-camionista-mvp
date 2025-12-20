import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { LogoutButton } from "@/components/logout-button";
import { getSessionUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Profilo</p>
            <h1 className="text-3xl font-semibold text-slate-900">Dettagli account</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Accesso verificato per {user.email}. Gestisci le tue informazioni principali da questa sezione.
            </p>
          </div>
          <SubscriptionBadge
            active={user.subscriptionActive}
            className="self-start"
            icon={user.subscriptionActive ? "lightning" : "check"}
          />
        </div>
      </div>

      <div className="card space-y-6 text-sm text-slate-700">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ruolo</p>
            <p className="text-base font-semibold text-slate-900">{user.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Creato il</p>
            <p className="text-base font-semibold text-slate-900">{new Date(user.createdAt).toLocaleString("it-IT")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stato abbonamento</p>
            <p className="text-base font-semibold text-slate-900">{user.subscriptionActive ? "Attivo" : "Non attivo"}</p>
          </div>
        </div>

        <div className="pt-2">
          <Suspense fallback={<p>Chiusura sessione...</p>}>
            <LogoutButton />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
