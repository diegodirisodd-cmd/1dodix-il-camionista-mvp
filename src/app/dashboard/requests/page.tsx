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
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Richieste</p>
            <h1 className="text-3xl font-semibold text-slate-900">Gestione richieste</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Accedi alle richieste di trasporto in base al tuo ruolo. I contatti completi sono disponibili per gli utenti abbonati.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isCompany && (
          <div className="card space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Azienda</p>
                <h2 className="text-lg font-semibold text-slate-900">Le tue richieste</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Pubblica</span>
            </div>
            <p className="text-sm text-slate-600">
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trasportatore</p>
                <h2 className="text-lg font-semibold text-slate-900">Richieste disponibili</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Consulta</span>
            </div>
            <p className="text-sm text-slate-600">
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</p>
                <h2 className="text-lg font-semibold text-slate-900">Supervisione richieste</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Solo lettura</span>
            </div>
            <p className="text-sm text-slate-600">
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
