import type { Request as RequestModel } from "@prisma/client";
import type { ReactNode } from "react";

import { SectionCard } from "@/components/dashboard/section-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type RequestWithCompany = RequestModel & { company: { email: string } };

type StatCardProps = {
  title: string;
  value: string;
  hint?: string;
  accent?: "primary" | "success" | "warning";
  action?: ReactNode;
};

function StatCard({ title, value, hint, accent = "primary", action }: StatCardProps) {
  const accents: Record<NonNullable<StatCardProps["accent"]>, string> = {
    primary: "from-brand-900 via-brand-700 to-brand-600",
    success: "from-green-800 via-green-600 to-green-500",
    warning: "from-accent-600 via-accent-500 to-accent-400",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-card backdrop-blur">
      <div className={`bg-gradient-to-r ${accents[accent]} px-4 py-3 text-white shadow-inner`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-neutral-100/80">
        <p className="leading-relaxed">{hint}</p>
        {action}
      </div>
    </div>
  );
}

export default async function TransporterDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  if (!user.subscriptionActive) {
    redirect("/paywall");
  }

  const subscriptionActive = user.subscriptionActive;

  const [recentRequests, availableLoads, companiesWithLoads] = await Promise.all([
    prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: { select: { email: true } } },
      take: 5,
    }),
    prisma.request.count(),
    prisma.request.findMany({ distinct: ["companyId"], select: { companyId: true } }),
  ]);

  const contactedCompanies = companiesWithLoads.length;
  const verificationStatus = {
    label: "In verifica",
    message: "Carica documenti e dati aziendali per ottenere il badge verificato e accelerare le conferme.",
  };

  return (
    <div className="space-y-8">
      <header className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Trasportatori</p>
          <h1 className="text-3xl text-white">Control room trasportatori</h1>
          <p className="max-w-3xl text-neutral-100/80">
            Carichi disponibili, aziende ingaggiate e stato di affidabilità in un unico pannello. Contatti e dati sensibili
            sono visibili solo ai profili verificati con abbonamento attivo.
          </p>
        </div>
        <a href="/dashboard/transporter/requests" className="btn-primary px-5 py-3 text-base">
          Trova carichi
        </a>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Carichi disponibili"
          value={availableLoads.toString()}
          hint="Nuove richieste pubblicate da aziende verificate."
          accent="primary"
          action={
            <a className="text-sm font-semibold text-white underline" href="/dashboard/transporter/requests">
              Vedi elenco
            </a>
          }
        />

        <StatCard
          title="Aziende contattate"
          value={contactedCompanies.toString()}
          hint="Aziende con richieste attive a cui puoi rispondere."
          accent="primary"
        />

        <StatCard
          title="Stato verifica"
          value={verificationStatus.label}
          hint={verificationStatus.message}
          accent="warning"
          action={<span className="badge">Trust &amp; Safety</span>}
        />

        <StatCard
          title="Abbonamento"
          value={subscriptionActive ? "Attivo" : "Non attivo"}
          hint={
            subscriptionActive
              ? "Accesso completo a contatti e briefing di carico."
              : "Completa il pagamento per sbloccare i contatti."
          }
          accent={subscriptionActive ? "success" : "warning"}
          action={
            !subscriptionActive ? (
              <a className="text-sm font-semibold text-white underline" href="/paywall">
                Attiva ora
              </a>
            ) : (
              <span className="badge-verified">Verificato</span>
            )
          }
        />
      </section>

      <SectionCard
        title="Affidabilità e verifica"
        description="Metti in evidenza il tuo profilo per creare fiducia con le aziende del network."
        actions={<span className="badge">Verifica in corso</span>}
        subtle
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-accent-300/30 bg-white/5 px-4 py-3 text-neutral-100/80">
            <p className="text-sm font-semibold text-white">Perché è importante</p>
            <p className="text-sm">
              Le aziende confermano più velocemente i carichi ai trasportatori verificati. Completa la verifica documentale
              per dimostrare affidabilità e ridurre tempi di onboarding.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Cosa fare ora</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-100/80">
              <li>Carica licenza e assicurazione per ottenere il badge di verifica.</li>
              <li>Associa il numero operativo per garantire contatti rapidi.</li>
              <li>Mantieni l&apos;abbonamento attivo per consultare subito i dettagli.</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <a className="btn-secondary" href="mailto:ops@dodix.com">
                Invia documenti
              </a>
              <a className="btn-primary" href="/dashboard/transporter/requests">
                Vedi carichi prioritari
              </a>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Carichi pubblicati dalle aziende"
        description="Incarichi recenti. Contatti disponibili solo ai trasportatori abbonati e verificati."
        actions={
          <a className="text-sm font-semibold text-accent-200 underline" href="/dashboard/transporter/requests">
            Vedi tutte le richieste
          </a>
        }
      >
        {recentRequests.length === 0 ? (
          <p className="text-sm text-neutral-200/80">Ancora nessuna richiesta pubblicata.</p>
        ) : (
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Titolo</th>
                  <th>Percorso</th>
                  <th>Budget</th>
                  <th>Contatti</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap font-semibold text-white">{request.title}</td>
                    <td className="whitespace-nowrap text-neutral-100/80">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="whitespace-nowrap text-neutral-100/80">{request.budget ?? "-"}</td>
                    <td className="text-neutral-100/80">
                      {subscriptionActive ? (
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold text-white">{request.contactName}</div>
                          <div className="text-neutral-200/80">{request.contactPhone}</div>
                          <div className="text-neutral-200/80">{request.contactEmail}</div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-neutral-200/80">
                          <span className="badge">Riservato</span>
                          <span>Attiva l&apos;abbonamento per sbloccare i contatti</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
