import type { Request as RequestModel } from "@prisma/client";

import { SectionCard } from "@/components/dashboard/section-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type RequestWithCompany = RequestModel & { company: { email: string } };

function maskContact(subscriptionActive: boolean, request: RequestWithCompany) {
  if (subscriptionActive) return request;

  const { contactName, contactPhone, contactEmail, ...rest } = request;
  return { ...rest, contactName: null, contactPhone: null, contactEmail: null };
}

export default async function TransporterRequestsPage() {
  const user = await getSessionUser();
  const isAdmin = user?.role === "ADMIN";

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER" && !isAdmin) {
    redirect("/dashboard");
  }

  const requests: RequestWithCompany[] = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { email: true } } },
  });

  const displayRequests = requests.map((request) => maskContact(isAdmin ? true : user.subscriptionActive, request));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Richieste disponibili</p>
        <h1>Trasporti pubblicati</h1>
        <p className="text-neutral-100/80">
          Consulta tutti i trasporti aperti pubblicati dalle aziende registrate. Dettagli e contatti restano bloccati per i
          profili senza abbonamento.
        </p>
      </header>

      <SectionCard
        title="Elenco incarichi"
        description="Percorso, dettagli carico e recapiti"
        actions={<span className="badge">{displayRequests.length} richieste</span>}
      >
        {displayRequests.length === 0 ? (
          <p className="text-sm text-neutral-200/80">Nessuna richiesta presente. Torna a controllare più tardi.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayRequests.map((request) => {
              const dateLabel = new Date(request.createdAt).toLocaleDateString("it-IT");

              return (
                <div
                  key={request.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-card backdrop-blur"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent-200">{request.company.email}</p>
                        <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                        <p className="text-sm text-neutral-200/80">{dateLabel}</p>
                      </div>
                      <span className="rounded-full bg-accent-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-100">
                        Attiva
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-neutral-100/85">
                      <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-white">
                        <span className="rounded-full bg-brand-900/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-200">
                          Pick-up
                        </span>
                        <span>{request.pickup}</span>
                        <span className="text-slate-600">→</span>
                        <span className="rounded-full bg-accent-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-100">
                          Drop-off
                        </span>
                        <span>{request.dropoff}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-neutral-200/90">
                        {request.cargo ? <span className="table-chip">{request.cargo}</span> : null}
                        {request.budget ? <span className="table-chip">Budget {request.budget}</span> : null}
                      </div>
                      <p className="text-sm text-neutral-200/80 line-clamp-3">{request.description || "Nessuna descrizione aggiuntiva."}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                    {request.contactName ? (
                      <div className="space-y-1 text-sm text-neutral-100/90">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent-200">Contatti azienda</p>
                        <p className="font-semibold text-white">{request.contactName}</p>
                        <p className="text-neutral-200/80">{request.contactPhone}</p>
                        <p className="text-neutral-200/80">{request.contactEmail}</p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm text-neutral-200/80">
                        <p className="table-chip warning inline-flex items-center gap-2">
                          <span className="text-base leading-none">🔒</span> Contatti bloccati
                        </p>
                        <p>Attiva l’abbonamento per visualizzare riferimenti e recapiti.</p>
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn-primary w-full justify-center"
                      disabled={!request.contactName}
                    >
                      Contact company
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
