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

  if (!user.subscriptionActive) {
    redirect("/paywall");
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
          Richieste inviate da aziende registrate. I contatti sono visibili solo con un abbonamento attivo
          {isAdmin ? " (gli admin possono consultarli in sola lettura)." : "."}
        </p>
      </header>

      <SectionCard
        title="Richieste"
        description="Elenco aggiornato in ordine cronologico"
        actions={
          <span className="badge">{displayRequests.length} richieste</span>
        }
      >
        {displayRequests.length === 0 ? (
          <p className="text-sm text-neutral-200/80">Nessuna richiesta presente. Torna a controllare più tardi.</p>
        ) : (
          <div className="space-y-4">
            <div className="table-shell overflow-x-auto hidden md:block">
              <table className="min-w-[960px]">
                <thead>
                  <tr>
                    <th>Titolo</th>
                    <th>Azienda</th>
                    <th>Percorso</th>
                    <th>Carico</th>
                    <th>Budget</th>
                    <th>Contatto</th>
                    <th className="text-right">Pubblicata</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="whitespace-nowrap font-semibold text-white">{request.title}</td>
                      <td className="whitespace-nowrap text-neutral-100/80">{request.company.email}</td>
                      <td className="whitespace-nowrap text-neutral-50">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-brand-900/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-200">Pick-up</span>
                          <span className="font-semibold text-white">{request.pickup}</span>
                          <span className="text-neutral-200">→</span>
                          <span className="rounded-full bg-accent-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-100">Drop-off</span>
                          <span className="font-semibold text-white">{request.dropoff}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-neutral-100/80">{request.cargo ?? "-"}</td>
                      <td className="whitespace-nowrap font-semibold text-white">{request.budget ?? "-"}</td>
                      <td className="text-neutral-100/80">
                        {request.contactName ? (
                          <div className="space-y-2">
                            <span className="table-chip success">Contatti sbloccati</span>
                            <div className="space-y-1 text-sm">
                              <div className="font-semibold text-white">{request.contactName}</div>
                              <div className="text-neutral-200/80">{request.contactPhone}</div>
                              <div className="text-neutral-200/80">{request.contactEmail}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-neutral-200/80">
                            <span className="table-chip warning">
                              <span className="text-base leading-none">🔒</span>
                              Contatti bloccati
                            </span>
                            <p className="leading-snug">Attiva l&apos;abbonamento per sbloccare numeri e email.</p>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-right text-neutral-200/80">
                        <div className="table-meta">{new Date(request.createdAt).toLocaleDateString("it-IT")}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:hidden">
              {displayRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent-200">{request.company.email}</p>
                      <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                      <p className="text-sm text-neutral-200/80">{new Date(request.createdAt).toLocaleDateString("it-IT")}</p>
                    </div>
                    <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-100">
                      {request.budget ?? "-"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span className="rounded-full bg-brand-900/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-200">Pick-up</span>
                      <span>{request.pickup}</span>
                      <span className="text-neutral-300">→</span>
                      <span className="rounded-full bg-accent-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-100">Drop-off</span>
                      <span>{request.dropoff}</span>
                    </div>
                    <p className="text-sm text-neutral-200/80">Carico: {request.cargo ?? "-"}</p>
                  </div>

                  <div className="mt-3 border-t border-white/10 pt-3">
                    {request.contactName ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-success">
                          <span className="table-chip success">Contatti sbloccati</span>
                        </div>
                        <div className="font-semibold text-white">{request.contactName}</div>
                        <div className="text-neutral-200/80">{request.contactPhone}</div>
                        <div className="text-neutral-200/80">{request.contactEmail}</div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-neutral-200/80">
                        <span className="table-chip warning">
                          <span className="text-base leading-none">🔒</span>
                          Contatti bloccati
                        </span>
                        <p className="leading-snug">Sottoscrivi l&apos;abbonamento per sbloccare i contatti diretti.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
