import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function TransporterDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  const subscriptionActive = hasActiveSubscription(user);

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-textStrong">Dashboard Trasportatore</p>
            <h1 className="text-3xl font-semibold text-textStrong">Nuovi trasporti pronti per te</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Accedi alle richieste delle aziende registrate e contatta i referenti quando sblocchi i contatti della richiesta.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" role={user.role} />
        </div>
        <p className="text-xs text-slate-600">Solo richieste reali, pubblicate da aziende operative.</p>
      </div>

      {!subscriptionActive && (
        <div className="card relative space-y-3 border border-warning/30 bg-card text-sm leading-relaxed text-textStrong">
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-warning ring-1 ring-warning/30">
            Commissione 2% – una tantum
          </div>
          <p className="text-lg font-semibold text-textStrong">Sblocca i contatti quando serve</p>
          <p className="text-slate-600">
            Per contattare direttamente le aziende e rispondere alle richieste sblocca i contatti della singola richiesta.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2"><span className="text-textStrong">✔</span> Contatti diretti verificati</li>
            <li className="flex items-start gap-2"><span className="text-textStrong">✔</span> Nessuna intermediazione</li>
            <li className="flex items-start gap-2"><span className="text-textStrong">✔</span> Priorità nelle richieste</li>
            <li className="flex items-start gap-2"><span className="text-textStrong">✔</span> Paghi solo quando sblocchi</li>
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover sm:w-auto"
              href="/dashboard/billing"
            >
              Sblocca contatti (commissione 2%)
            </Link>
            <p className="text-xs font-medium text-slate-600">Paghi solo quando sblocchi i contatti.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-textStrong">Richieste disponibili</h2>
            <p className="text-sm leading-relaxed text-slate-600">Consulta le tratte compatibili e valuta i carichi.</p>
          </div>
          <Link href="/dashboard/transporter/jobs" className="btn btn-primary">
            Vedi richieste
          </Link>
          <p className="text-xs text-slate-600">Contatti visibili solo dopo lo sblocco con commissione.</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-textStrong">Commissione per richiesta</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Scopri come funziona lo sblocco dei contatti per richiesta.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="btn btn-secondary"
          >
            Dettagli commissioni
          </Link>
          <p className="text-xs text-slate-600">Paghi solo quando sblocchi i contatti.</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-textStrong">Profilo</h2>
            <p className="text-sm leading-relaxed text-slate-600">Aggiorna mezzi, tratte preferite e recapiti.</p>
          </div>
          <Link href="/dashboard/transporter/profile" className="btn btn-secondary">
            Vai al profilo
          </Link>
          <p className="text-xs text-slate-600">Resta visibile alle aziende verifiche.</p>
        </div>
      </div>
    </section>
  );
}
