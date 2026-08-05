import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ScrollReveal } from "@/components/scroll-reveal";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Dashboard azienda",
  description:
    "Pubblica richieste di trasporto, monitora le spedizioni e gestisci i contatti con i trasportatori.",
};

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
      <div className="card animate-fadeUp space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Dashboard Azienda</p>
            <h1>Trova trasportatori affidabili, senza intermediari</h1>
            <p className="text-sm leading-relaxed text-neutral-600">
              Pubblica richieste di trasporto e ricevi contatti verificati. Gestisci ogni spedizione in modo chiaro e diretto.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" role={user.role} />
        </div>
        <p className="text-xs text-neutral-600">Le richieste sono visibili solo a trasportatori registrati.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ScrollReveal className="h-full">
          <div className="card card-hover flex h-full flex-col space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg">Pubblica una nuova spedizione</h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Inserisci tratta, carico e referenti per ricevere contatti diretti.
              </p>
            </div>
            <Link href="/dashboard/company/new-request" className="btn-primary min-h-[44px]">
              Crea una nuova richiesta di trasporto
            </Link>
            <p className="text-xs text-neutral-600">Nessun intermediario. Contatto diretto.</p>
            <p className="text-xs font-semibold text-neutral-600">
              Commissione applicata solo quando sblocchi i contatti.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="h-full" delayMs={80}>
          <div className="card card-hover flex h-full flex-col space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg">Richieste inviate</h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Storico richieste e stato contatti con i trasportatori.
              </p>
            </div>
            <Link href="/dashboard/company/requests" className="btn-secondary min-h-[44px]">
              Vedi richieste
            </Link>
            <p className="text-xs text-neutral-600">
              Totale richieste:{" "}
              <span className="stat-mono font-semibold text-textStrong">{requestCount}</span>
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="h-full" delayMs={160}>
          <div className="card card-hover flex h-full flex-col space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg">Profilo aziendale</h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Aggiorna i dati di contatto e mantieni la tua azienda verificata.
              </p>
            </div>
            <Link href="/dashboard/company/profile" className="btn-secondary min-h-[44px]">
              Vai al profilo
            </Link>
            <p className="text-xs text-neutral-600">Mantieni aggiornati referenti e recapiti.</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
