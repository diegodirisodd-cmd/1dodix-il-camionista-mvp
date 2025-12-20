import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";

export default async function SubscriptionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Abbonamento</p>
            <h1 className="text-3xl font-semibold text-slate-900">Gestisci l’accesso premium</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              L’abbonamento sblocca i contatti diretti e le funzionalità avanzate. Attivalo per operare senza limitazioni.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
      </div>

      <div className="card space-y-4 text-sm text-slate-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stato attuale</p>
            <p className="text-lg font-semibold text-slate-900">
              {user.subscriptionActive ? "Abbonamento attivo" : "Abbonamento non attivo"}
            </p>
            <p className="text-sm text-slate-600">
              {user.subscriptionActive
                ? "Hai accesso completo alle funzioni premium."
                : "Attiva l’abbonamento per sbloccare contatti e pubblicazione richieste."}
            </p>
          </div>
          <div className="flex gap-2">
            {!user.subscriptionActive && (
              <Link className="btn btn-primary" href="/paywall">
                Attiva abbonamento
              </Link>
            )}
            <Link className="btn btn-secondary" href="/dashboard">
              Torna alla dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Cosa sblocchi</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-800">
              <li>• Contatti visibili nelle richieste</li>
              <li>• Pubblicazione e gestione incarichi</li>
              <li>• Priorità nei risultati per utenti verificati</li>
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Supporto</p>
            <p className="mt-2 text-sm text-slate-800 leading-relaxed">
              In caso di problemi con la fatturazione o l’accesso, contattaci: supporto@dodix.it
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
