import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { billingPathForRole, hasActiveSubscription } from "@/lib/subscription";

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
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Dashboard Trasportatore</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Nuovi trasporti pronti per te</h1>
            <p className="text-sm leading-relaxed text-[#475569]">Accedi alle richieste delle aziende registrate e contatta i referenti quando sblocchi l’accesso operativo completo.</p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" role={user.role} />
        </div>
        <p className="text-xs text-[#64748b]">Solo richieste reali, pubblicate da aziende operative.</p>
      </div>

      {!subscriptionActive && (
        <div className="card relative space-y-3 border border-[#f5c76a] bg-white text-sm leading-relaxed text-[#0f172a]">
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#fff8ed] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#92400e] ring-1 ring-[#f5c76a]">
            Accesso limitato
          </div>
          <p className="text-lg font-semibold text-[#0f172a]">Sblocca l’accesso operativo completo</p>
          <p className="text-[#475569]">
            Per contattare direttamente le aziende e rispondere alle richieste serve il piano professionale attivo.
          </p>
          <ul className="space-y-2 text-sm text-[#475569]">
            <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Contatti diretti verificati</li>
            <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Nessuna intermediazione</li>
            <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Priorità nelle richieste</li>
            <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Disdici quando vuoi</li>
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#f5c76a] to-[#f29f58] px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:brightness-95 sm:w-auto"
              href="/dashboard/billing"
            >
              Sblocca operatività
            </Link>
            <p className="text-xs font-medium text-[#64748b]">Pagamenti sicuri con Stripe · Disdici quando vuoi · Accesso immediato</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Richieste disponibili</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Consulta le tratte compatibili e valuta i carichi.</p>
          </div>
          <Link href="/dashboard/transporter/jobs" className="btn btn-primary">
            Vedi richieste
          </Link>
          <p className="text-xs text-[#64748b]">Contatti visibili solo con l’accesso operativo completo attivo.</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Piano professionale</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Gestisci il tuo accesso operativo e verifica lo stato dei contatti.</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="btn btn-secondary"
          >
            {subscriptionActive ? "Vedi piano attivo" : "Sblocca operatività"}
          </Link>
          <p className="text-xs text-[#64748b]">Sblocca contatti diretti e opportunità costanti.</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Profilo</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Aggiorna mezzi, tratte preferite e recapiti.</p>
          </div>
          <Link href="/dashboard/transporter/profile" className="btn btn-secondary">
            Vai al profilo
          </Link>
          <p className="text-xs text-[#64748b]">Resta visibile alle aziende verifiche.</p>
        </div>
      </div>
    </section>
  );
}
