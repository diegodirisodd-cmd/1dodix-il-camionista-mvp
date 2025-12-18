import type { ReactNode } from "react";

import { SectionCard } from "@/components/dashboard/section-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

  const subscriptionActive = user.subscriptionActive;

  return (
    <div className="space-y-10">
      <header className="card space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/15">
              <span className="rounded-full bg-accent-500/20 px-3 py-1 text-accent-100">Ruolo</span>
              <span className="text-white/90">Transporter</span>
              <span className="text-neutral-200/80">{user.email}</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-white lg:text-4xl">Benvenuto nella control room trasportatori</h1>
              <p className="max-w-4xl text-neutral-100/80">
                Visualizza carichi disponibili, mantieni l’abbonamento attivo e lavora solo con aziende verificate in un layout premium e ordinato.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <a className="btn-primary px-6 py-3 text-base shadow-lg shadow-brand-900/30" href="/dashboard/transporter/requests">
              Trova carichi
            </a>
            <p className="text-sm text-neutral-100/70">Accesso diretto ai carichi pubblicati dalle aziende.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Carichi disponibili"
            value={availableLoads.toString()}
            hint="Richieste pubblicate dalle aziende verificate."
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
            hint="Account con richieste attive a cui puoi rispondere."
            accent="primary"
          />

          <StatCard
            title="Stato abbonamento"
            value={subscriptionActive ? "Attivo" : "Non attivo"}
            hint={
              subscriptionActive
                ? "Contatti e briefing sono sbloccati."
                : "Completa il pagamento per vedere recapiti e dettagli."
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
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Accesso e abbonamento"
          description="Cosa è incluso e cosa resta bloccato senza pagamento."
          className="flex flex-col justify-between"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-accent-400/30 bg-white/5 p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-200">Cosa sblocchi</p>
              <ul className="mt-2 space-y-2 text-sm text-neutral-100/80">
                <li>Contatti completi delle aziende (telefono, email, referente).</li>
                <li>Briefing operativi e budget pubblicati.</li>
                <li>Priorità nelle conferme per profili verificati.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Senza pagamento</p>
              <p className="mt-1 text-lg font-semibold text-white">Accesso limitato</p>
              <p className="mt-2 text-sm text-neutral-100/80">
                Vedi solo titoli e percorsi: i contatti restano oscurati. Attiva l’abbonamento per lavorare con le aziende.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="btn-primary" href="/paywall">
                  Attiva abbonamento
                </a>
                <a className="btn-secondary" href="/dashboard/transporter/requests">
                  Vedi carichi
                </a>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Affidabilità e verifica"
          description="Metti in evidenza il tuo profilo per creare fiducia con le aziende del network."
          actions={<span className="badge">{verificationStatus.label}</span>}
          subtle
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-accent-300/30 bg-white/5 px-4 py-3 text-neutral-100/80">
              <p className="text-sm font-semibold text-white">Perché è importante</p>
              <p className="text-sm">
                Le aziende confermano più velocemente i carichi ai trasportatori verificati. Completa la verifica documentale per dimostrare affidabilità e ridurre tempi di onboarding.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">Cosa fare ora</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-100/80">
                <li>Carica licenza e assicurazione per ottenere il badge di verifica.</li>
                <li>Associa il numero operativo per garantire contatti rapidi.</li>
                <li>Mantieni l’abbonamento attivo per consultare subito i dettagli.</li>
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
      </section>

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
          <div className="table-shell overflow-x-auto">
            <table className="min-w-[820px]">
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
                    <td className="whitespace-nowrap font-semibold text-white">{request.budget ?? "-"}</td>
                    <td className="text-neutral-100/80">
                      {subscriptionActive ? (
                        <div className="space-y-2 text-sm">
                          <span className="table-chip success">Contatti sbloccati</span>
                          <div className="space-y-1">
                            <div className="font-semibold text-white">{request.contactName}</div>
                            <div className="text-neutral-200/80">{request.contactPhone}</div>
                            <div className="text-neutral-200/80">{request.contactEmail}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm text-neutral-200/80">
                          <span className="table-chip warning">Contatti bloccati</span>
                          <p className="leading-snug">Abbonati per vedere email e telefono del referente.</p>
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
