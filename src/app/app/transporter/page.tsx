import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export default async function TransporterAppPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const requestsCount = await prisma.request.count();

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Trasportatore</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Trova carichi compatibili e contatta direttamente</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Accedi alle richieste delle aziende registrate e abilita i contatti quando sei pronto a collaborare.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#0f172a]">Richieste disponibili</p>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Visualizza incarichi pubblicati da aziende verificate.
            </p>
            <Link href="/app/transporter/requests" className="btn-primary mt-3 inline-flex w-full justify-center">
              Vedi richieste
            </Link>
          </div>

          <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#0f172a]">Profilo</p>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Aggiorna le tratte principali e i contatti per ricevere richieste coerenti.
            </p>
            <Link href="/app/transporter/profile" className="btn-secondary mt-3 inline-flex w-full justify-center">
              Vai al profilo
            </Link>
          </div>

          <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#0f172a]">Abbonamento</p>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Sblocca i contatti aziendali e lavora senza intermediari.
            </p>
            <Link
              href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-3 inline-flex w-full justify-center"
            >
              Attiva abbonamento
            </Link>
          </div>
        </div>
      </div>

      <div className="card space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#0f172a]">Richieste disponibili ora</h2>
            <p className="text-sm text-[#475569]">{requestsCount} incarichi pubblicati dalle aziende.</p>
          </div>
          <Link href="/app/transporter/requests" className="btn-primary">
            Vai alle richieste
          </Link>
        </div>

        <p className="text-xs text-[#64748b]">
          Senza abbonamento puoi visualizzare solo i dettagli generali. Attiva l’accesso per vedere i contatti.
        </p>
      </div>
    </section>
  );
}
