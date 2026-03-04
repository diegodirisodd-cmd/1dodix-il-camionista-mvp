import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function CompanyDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const isSubscribed = hasActiveSubscription(user);
  const requestCount = await prisma.request.count({ where: { companyId: user.id } });

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-textStrong">Dashboard Azienda</p>
            <h1 className="text-3xl font-semibold text-textStrong">Trova trasportatori affidabili, senza intermediari</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Pubblica richieste di trasporto e ricevi contatti verificati. Gestisci ogni spedizione in modo chiaro e diretto.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" role={user.role} />
        </div>
        <p className="text-xs text-slate-600">Le richieste sono visibili solo a trasportatori registrati.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-textStrong">Pubblica una nuova spedizione</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Inserisci tratta, carico e referenti per ricevere contatti diretti.
            </p>
          </div>
          <Link
            href="/dashboard/company/new-request"
            className="btn btn-primary"
          >
            Crea una nuova richiesta di trasporto
          </Link>
          <p className="text-xs text-slate-600">Nessun intermediario. Contatto diretto.</p>
          <p className="text-xs font-semibold text-slate-600">Commissione applicata solo quando sblocchi i contatti.</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-textStrong">Richieste inviate</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Storico richieste e stato contatti con i trasportatori.
            </p>
          </div>
          <Link href="/dashboard/company/requests" className="btn btn-secondary">
            Vedi richieste
          </Link>
          <p className="text-xs text-slate-600">Totale richieste: {requestCount}</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-textStrong">Profilo aziendale</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Aggiorna i dati di contatto e mantieni la tua azienda verificata.
            </p>
          </div>
          <Link href="/dashboard/company/profile" className="btn btn-secondary">
            Vai al profilo
          </Link>
          <p className="text-xs text-slate-600">Mantieni aggiornati referenti e recapiti.</p>
        </div>
      </div>
    </section>
  );
}
