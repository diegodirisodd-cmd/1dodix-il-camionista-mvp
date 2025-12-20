import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    // Protezione difensiva: il middleware dovrebbe già bloccare l'accesso.
    redirect("/login");
  }

  const isAdmin = user.role === "ADMIN";

  if (isAdmin) {
    redirect("/dashboard/admin");
  }

  const requestCtaLabel = user.role === "COMPANY" ? "Crea richiesta" : "Vedi richieste";
  const requestHref = user.role === "COMPANY" ? "/dashboard/company#pubblica" : "/dashboard/requests";
  const subscriptionCta = user.subscriptionActive ? "Gestisci abbonamento" : "Attiva abbonamento";

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-900">Benvenuto in DodiX</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Controlla profilo, richieste e abbonamento in un’unica panoramica. Usa le azioni rapide per andare subito alla sezione corretta.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Profilo</p>
          <h2 className="text-lg font-semibold text-slate-900">Dati account</h2>
          <p className="text-sm leading-relaxed text-slate-600">Email, ruolo e storicità sempre aggiornati.</p>
          <Link className="btn btn-secondary" href="/dashboard/profile">
            Gestisci profilo
          </Link>
        </div>

        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Richieste</p>
          <h2 className="text-lg font-semibold text-slate-900">Operatività</h2>
          <p className="text-sm leading-relaxed text-slate-600">Pubblica incarichi se sei azienda o consulta quelli disponibili.</p>
          <Link className="btn btn-primary" href={requestHref}>
            {requestCtaLabel}
          </Link>
        </div>

        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Abbonamento</p>
          <h2 className="text-lg font-semibold text-slate-900">Accesso premium</h2>
          <p className="text-sm leading-relaxed text-slate-600">Controlla lo stato e attiva l’accesso se necessario.</p>
          <Link className="btn btn-secondary" href="/dashboard/subscription">
            {subscriptionCta}
          </Link>
        </div>
      </div>

      <div className="card space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">Dati rapidi</h2>
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
      </div>
    </section>
  );
}
