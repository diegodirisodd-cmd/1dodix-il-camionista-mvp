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

  const requestCtaLabel = user.role === "COMPANY" ? "Crea una nuova richiesta di trasporto" : "Vedi richieste";
  const requestHref = user.role === "COMPANY" ? "/dashboard/company#pubblica" : "/dashboard/requests";
  const subscriptionCta = user.subscriptionActive ? "Gestisci piano" : "Sblocca l’accesso completo";

  return (
    <section className="space-y-6">
      <div className="card space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Panoramica operativa</p>
            <h1 className="text-3xl font-semibold text-slate-900">Benvenuto in DodiX</h1>
            <p className="text-sm leading-relaxed text-slate-700">
              Controlla profilo, richieste e piano di accesso in un’unica vista. Le scorciatoie qui sotto ti portano direttamente dove operi più spesso.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Profilo</p>
          <h2 className="text-xl font-semibold text-slate-900">Dati account</h2>
          <p className="text-sm leading-relaxed text-slate-700">Email, ruolo e storicità sempre aggiornati in un’unica area.</p>
          <Link className="btn btn-secondary" href="/dashboard/profile">
            Gestisci profilo
          </Link>
          <p className="text-xs text-slate-600">Mantieni i dati corretti per accelerare le comunicazioni.</p>
        </div>

        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Richieste</p>
          <h2 className="text-xl font-semibold text-slate-900">Operatività</h2>
          <p className="text-sm leading-relaxed text-slate-700">Pubblica incarichi se sei azienda o consulta quelli disponibili.</p>
          <Link className="btn btn-primary" href={requestHref}>
            {requestCtaLabel}
          </Link>
          <p className="text-xs text-slate-600">Nessun intermediario. Contatto diretto.</p>
        </div>

        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Piano di accesso</p>
          <h2 className="text-xl font-semibold text-slate-900">Accesso premium</h2>
          <p className="text-sm leading-relaxed text-slate-700">Controlla lo stato e attiva l’accesso se necessario.</p>
          <Link className="btn btn-secondary" href="/dashboard/subscription">
            {subscriptionCta}
          </Link>
          <p className="text-xs text-slate-600">I dettagli sono nascosti finché l’abbonamento non è attivo.</p>
        </div>
      </div>

      <div className="card space-y-3 text-sm leading-relaxed text-slate-700">
        <h2 className="text-xl font-semibold text-slate-900">Dati rapidi</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Ruolo</p>
            <p className="text-base font-semibold text-slate-900">{user.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Creato il</p>
            <p className="text-base font-semibold text-slate-900">{new Date(user.createdAt).toLocaleString("it-IT")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Stato abbonamento</p>
            <p className="text-base font-semibold text-slate-900">{user.subscriptionActive ? "Attivo" : "Non attivo"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
