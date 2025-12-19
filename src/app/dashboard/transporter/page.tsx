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

  const [recentRequests, availableLoads] = await Promise.all([
    prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: { select: { email: true } } },
      take: 5,
    }),
    prisma.request.count(),
  ]);

  const subscriptionActive = user.subscriptionActive;

  return (
    <div className="space-y-8">
      <header className="card space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15">
              <span className="rounded-full bg-accent-500/25 px-3 py-0.5 text-accent-50">Ruolo</span>
              <span className="text-white/90">Trasportatore</span>
              <span className="text-neutral-200/80">{user.email}</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-white lg:text-4xl">Dashboard Trasportatore</h1>
              <p className="max-w-3xl text-sm text-neutral-100/80 md:text-base">
                Consulta incarichi pubblicati da aziende verificate, mantieni attivo l’abbonamento e seleziona subito i carichi pertinenti.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <a className="btn-primary px-6 py-3 text-base shadow-lg shadow-brand-900/30" href="/dashboard/transporter/requests">
              Apri elenco carichi
            </a>
            <p className="text-xs text-neutral-100/70 sm:text-sm">Vai direttamente alle richieste disponibili e valuta le tratte.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Stato abbonamento"
            value={subscriptionActive ? "Attivo" : "Non attivo"}
            hint={
              subscriptionActive
                ? "Contatti e briefing sono sbloccati."
                : "Contatti oscurati finché non attivi l’abbonamento."
            }
            accent={subscriptionActive ? "success" : "warning"}
            action={
              subscriptionActive ? (
                <span className="badge-verified">Attivo</span>
              ) : (
                <a className="btn-primary px-4 py-2 text-sm" href="/paywall">
                  Attiva abbonamento
                </a>
              )
            }
          />

          <StatCard
            title="Richieste disponibili"
            value={availableLoads.toString()}
            hint="Carichi pubblicati da aziende con profilo verificato."
            accent="primary"
            action={
              <a className="text-sm font-semibold text-white underline" href="/dashboard/transporter/requests">
                Consulta richieste
              </a>
            }
          />

          <StatCard
            title="Priorità operativa"
            value="Apri richieste"
            hint="Accedi all’elenco completo e blocca i carichi pertinenti."
            accent="primary"
            action={
              <a className="btn-secondary px-4 py-2 text-sm" href="/dashboard/transporter/requests">
                Vai alle richieste
              </a>
            }
          />
        </div>
      </header>

      {!subscriptionActive ? (
        <SectionCard
          title="Contenuto bloccato"
          description="Serve un abbonamento attivo per sbloccare contatti, briefing e richieste complete."
          className="border-accent-500/40 bg-gradient-to-r from-brand-900/70 via-brand-800/60 to-brand-700/60"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 text-neutral-100/90">
              <p className="text-lg font-semibold text-white">Attiva l’accesso premium</p>
              <p className="text-sm text-neutral-100/80">
                Sblocca i dettagli di contatto delle aziende, ricevi briefing completi e prenota i carichi direttamente.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a className="btn-primary px-6 py-3 text-base shadow-lg shadow-brand-900/40" href="/paywall">
                Attiva abbonamento
              </a>
              <a className="btn-secondary" href="/dashboard/transporter/requests">
                Visualizza richieste (anteprima)
              </a>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Accesso e abbonamento"
          description="Cosa sblocchi con il pagamento e cosa rimane oscurato."
          className="flex flex-col justify-between"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-accent-400/30 bg-white/5 p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-200">Cosa sblocchi</p>
              <ul className="mt-2 space-y-2 text-sm text-neutral-100/80">
                <li>Contatti completi delle aziende (telefono, email, referente).</li>
                <li>Briefing operativi con percorso, finestra e carico chiariti.</li>
                <li>Priorità nelle conferme per profili verificati.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Senza pagamento</p>
              <p className="mt-1 text-lg font-semibold text-white">Accesso limitato</p>
              <p className="mt-2 text-sm text-neutral-100/80">
                Titoli e percorsi restano consultabili, ma i contatti sono oscurati. Abbonati per parlare direttamente con le aziende.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="btn-primary" href="/paywall">
                  Attiva abbonamento
                </a>
                <a className="btn-secondary" href="/dashboard/transporter/requests">
                  Consulta i carichi
                </a>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Affidabilità e verifica"
          description="Metti in evidenza il tuo profilo per creare fiducia con le aziende del network."
          actions={<span className="badge">In verifica</span>}
          subtle
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-accent-300/30 bg-white/5 px-4 py-3 text-neutral-100/80">
              <p className="text-sm font-semibold text-white">Perché è importante</p>
              <p className="text-sm">
                Le aziende assegnano più velocemente i carichi ai trasportatori verificati. Completa la verifica documentale per dimostrare affidabilità e ridurre i tempi di onboarding.
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
                  Apri carichi prioritari
                </a>
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

        <SectionCard
          title="Carichi pubblicati dalle aziende"
          description="Incarichi recenti; i contatti completi si sbloccano solo con abbonamento attivo."
          actions={
            <a className="text-sm font-semibold text-accent-200 underline" href="/dashboard/transporter/requests">
              Vai alla lista completa
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
                    <th>Finestra</th>
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
                    <td className="whitespace-nowrap text-neutral-100/80">{request.timeWindow}</td>
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
                          <p className="leading-snug">Attiva l’abbonamento per sbloccare contatti e briefing.</p>
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
