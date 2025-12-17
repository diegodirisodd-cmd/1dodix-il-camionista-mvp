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
    primary: "from-brand-800 via-brand-700 to-brand-600",
    success: "from-emerald-700 via-emerald-600 to-emerald-500",
    warning: "from-amber-600 via-amber-500 to-amber-400",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className={`rounded-t-xl bg-gradient-to-r ${accents[accent]} px-4 py-3 text-white`}>
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-neutral-700">
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
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Trasportatori</p>
          <h1 className="text-3xl font-semibold text-brand-900">Control room trasportatori</h1>
          <p className="max-w-3xl text-neutral-700">
            Carichi disponibili, aziende ingaggiate e stato di affidabilità in un unico pannello. Contatti e dati
            sensibili sono visibili solo ai profili verificati con abbonamento attivo.
          </p>
        </div>
        <a
          href="/dashboard/transporter/requests"
          className="button-primary inline-flex items-center justify-center px-5"
        >
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
          action={<span className="badge badge-amber">Trust &amp; Safety</span>}
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
              <span className="badge badge-emerald">Verificato</span>
            )
          }
        />
      </section>

      <SectionCard
        title="Affidabilità e verifica"
        description="Metti in evidenza il tuo profilo per creare fiducia con le aziende del network."
        actions={<span className="badge badge-amber">Verifica in corso</span>}
        subtle
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-neutral-800">
            <p className="text-sm font-semibold text-amber-800">Perché è importante</p>
            <p className="text-sm">
              Le aziende confermano più velocemente i carichi ai trasportatori verificati. Completa la verifica
              documentale per dimostrare affidabilità e ridurre tempi di onboarding.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-800">Cosa fare ora</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-800">
              <li>Carica licenza e assicurazione per ottenere il badge di verifica.</li>
              <li>Associa il numero operativo per garantire contatti rapidi.</li>
              <li>Mantieni l&apos;abbonamento attivo per consultare subito i dettagli.</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <a className="button-secondary" href="mailto:ops@dodix.com">
                Invia documenti
              </a>
              <a className="button-ghost" href="/dashboard/transporter/requests">
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
          <a className="text-sm font-semibold text-brand-800" href="/dashboard/transporter/requests">
            Vedi tutte le richieste
          </a>
        }
      >
        {recentRequests.length === 0 ? (
          <p className="text-sm text-neutral-700">Ancora nessuna richiesta pubblicata.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Titolo</th>
                  <th className="px-4 py-3 font-semibold">Percorso</th>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">Contatti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-900">{request.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-800">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-800">{request.budget ?? "-"}</td>
                    <td className="px-4 py-3 text-neutral-800">
                      {subscriptionActive ? (
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold text-brand-900">{request.contactName}</div>
                          <div className="text-neutral-700">{request.contactPhone}</div>
                          <div className="text-neutral-700">{request.contactEmail}</div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <span className="badge badge-amber">Riservato</span>
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
