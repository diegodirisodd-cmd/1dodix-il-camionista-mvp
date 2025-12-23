import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";

export default async function TransporterDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  const subscriptionActive = Boolean(user.subscriptionActive);

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Dashboard Trasportatore</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Nuovi trasporti pronti per te</h1>
            <p className="text-sm leading-relaxed text-[#475569]">Accedi alle richieste delle aziende registrate.</p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" />
        </div>
        <p className="text-xs text-[#64748b]">Solo richieste reali, pubblicate da aziende operative.</p>
      </div>

      {!subscriptionActive && (
        <div className="card space-y-3 border-amber-200 bg-amber-50/60 text-sm leading-relaxed text-[#0f172a]">
          <p className="font-semibold">Sblocca i contatti delle aziende</p>
          <p className="text-[#475569]">Senza abbonamento puoi vedere solo i dettagli generali delle richieste.</p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="btn btn-primary"
              href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
              target="_blank"
              rel="noopener noreferrer"
            >
              Attiva l&apos;abbonamento per vedere i contatti
            </Link>
            <p className="text-xs text-[#64748b]">Accesso diretto ai referenti aziendali senza intermediari.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Richieste disponibili</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Consulta le tratte compatibili e valuta i carichi.</p>
          </div>
          <Link href="/dashboard/transporter/requests" className="btn btn-primary">
            Vedi richieste
          </Link>
          <p className="text-xs text-[#64748b]">Contatti visibili solo con abbonamento attivo.</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Abbonamento</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Gestisci il tuo accesso e verifica lo stato dei contatti.</p>
          </div>
          <Link
            href={subscriptionActive ? "/dashboard/transporter/requests" : "https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"}
            className="btn btn-secondary"
            target={subscriptionActive ? undefined : "_blank"}
            rel={subscriptionActive ? undefined : "noopener noreferrer"}
          >
            {subscriptionActive ? "Stato abbonamento" : "Attiva abbonamento"}
          </Link>
          <p className="text-xs text-[#64748b]">Sblocca contatti diretti e opportunità costanti.</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Profilo</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Aggiorna mezzi, tratte preferite e recapiti.</p>
          </div>
          <Link href="/dashboard/profile" className="btn btn-secondary">
            Vai al profilo
          </Link>
          <p className="text-xs text-[#64748b]">Resta visibile alle aziende verifiche.</p>
        </div>
      </div>
    </section>
  );
}
