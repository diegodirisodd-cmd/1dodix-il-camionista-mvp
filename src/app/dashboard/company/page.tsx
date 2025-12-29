import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CompanyDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const isSubscribed = Boolean(user.subscriptionActive);
  const requestCount = await prisma.request.count({ where: { companyId: user.id } });

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Dashboard Azienda</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Trova trasportatori affidabili, senza intermediari</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Pubblica richieste di trasporto e ricevi contatti verificati. Gestisci ogni spedizione in modo chiaro e diretto.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" />
        </div>
        <p className="text-xs text-[#64748b]">Le richieste sono visibili solo a trasportatori registrati.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Pubblica una nuova spedizione</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Inserisci tratta, carico e referenti per ricevere contatti diretti.</p>
          </div>
          <Link
            href={isSubscribed ? "/dashboard/company/new-request" : "https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"}
            className="btn btn-primary"
            target={isSubscribed ? undefined : "_blank"}
            rel={isSubscribed ? undefined : "noopener noreferrer"}
          >
            Crea una nuova richiesta di trasporto
          </Link>
          <p className="text-xs text-[#64748b]">Nessun intermediario. Contatto diretto.</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Richieste inviate</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Storico richieste e stato contatti con i trasportatori.</p>
          </div>
          <Link href="/dashboard/company/requests" className="btn btn-secondary">
            Vedi richieste
          </Link>
          <p className="text-xs text-[#64748b]">Totale richieste: {requestCount}</p>
        </div>

        <div className="card space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">Profilo aziendale</h2>
            <p className="text-sm leading-relaxed text-[#475569]">Aggiorna i dati di contatto e mantieni la tua azienda verificata.</p>
          </div>
          <Link href="/dashboard/company/profile" className="btn btn-secondary">
            Vai al profilo
          </Link>
          <p className="text-xs text-[#64748b]">Mantieni aggiornati referenti e recapiti.</p>
        </div>
      </div>
    </section>
  );
}
