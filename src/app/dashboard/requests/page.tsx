import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";

export default async function RequestsHubPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const isCompany = user.role === "COMPANY";
  const isTransporter = user.role === "TRANSPORTER";
  const isAdmin = user.role === "ADMIN";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Richieste</p>
          <h1>Gestione richieste</h1>
          <p className="text-neutral-100/80">
            Accedi rapidamente alle richieste di trasporto in base al tuo ruolo. I contatti completi sono disponibili per gli utenti abbonati.
          </p>
        </div>
        <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isCompany && (
          <div className="card space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent-200">Azienda</p>
                <p className="text-lg font-semibold">Le tue richieste</p>
              </div>
              <span className="rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-100">
                Pubblica
              </span>
            </div>
            <p className="text-sm text-neutral-200">
              Crea nuove richieste o controlla quelle esistenti dalla dashboard aziendale.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link className="btn btn-primary" href="/dashboard/company#publication">
                Crea richiesta
              </Link>
              <Link className="btn btn-secondary" href="/dashboard/company">
                Vai alla dashboard azienda
              </Link>
            </div>
          </div>
        )}

        {isTransporter && (
          <div className="card space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent-200">Trasportatore</p>
                <p className="text-lg font-semibold">Richieste disponibili</p>
              </div>
              <span className="rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-100">
                Consulta
              </span>
            </div>
            <p className="text-sm text-neutral-200">
              Vedi le richieste pubblicate dalle aziende e contatta i referenti se il tuo abbonamento è attivo.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link className="btn btn-primary" href="/dashboard/transporter/requests">
                Vedi richieste
              </Link>
              <Link className="btn btn-secondary" href="/dashboard/transporter">
                Panoramica trasportatore
              </Link>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="card space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent-200">Admin</p>
                <p className="text-lg font-semibold">Supervisione richieste</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Solo lettura</span>
            </div>
            <p className="text-sm text-neutral-200">
              Consulta l’intero elenco delle richieste per monitorare l’attività della piattaforma.
            </p>
            <Link className="btn btn-secondary" href="/dashboard/admin">
              Vai alla vista admin
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
