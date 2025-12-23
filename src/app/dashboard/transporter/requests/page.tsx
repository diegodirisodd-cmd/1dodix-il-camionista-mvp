import type { Request as RequestModel } from "@prisma/client";

import { SectionCard } from "@/components/dashboard/section-card";
import { SubscriptionBadge } from "@/components/subscription-badge";
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
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Richieste disponibili</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Trasporti pubblicati</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Consulta i trasporti aperti pubblicati dalle aziende registrate. I contatti restano bloccati finché l’abbonamento non è attivo.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
        {!user.subscriptionActive && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="leading-relaxed text-slate-800">Attiva l’abbonamento per vedere i contatti e chiamare subito le aziende.</p>
              <a
                className="btn btn-primary w-full justify-center sm:w-auto"
                href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
                target="_blank"
                rel="noopener noreferrer"
              >
                Attiva accesso completo
              </a>
            </div>
            <p className="mt-2 text-xs font-medium text-[#475569]">Sblocca contatti diretti, richieste illimitate e priorità di visibilità.</p>
          </div>
        )}
      </div>

      <SectionCard
        title="Elenco incarichi"
        description="Percorso, dettagli del carico e recapiti"
        actions={<span className="badge">{displayRequests.length} richieste</span>}
      >
        {displayRequests.length === 0 ? (
          <p className="text-sm leading-relaxed text-[#475569]">Nessuna richiesta presente. Torna a controllare più tardi.</p>
        ) : (
          <div className="table-shell overflow-x-auto">
            <table className="min-w-[960px]">
              <thead>
                <tr>
                  <th>Percorso</th>
                  <th>Carico</th>
                  <th>Budget</th>
                  <th>Contatti</th>
                  <th>Pubblicata</th>
                </tr>
              </thead>
              <tbody>
                {displayRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="text-[#475569]">
                      <span className="font-semibold text-[#0f172a]">{request.pickup}</span> → {request.dropoff}
                    </td>
                    <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                    <td className="text-[#475569]">{request.budget ?? "—"}</td>
                    <td className="text-[#475569]">
                      {request.contactName ? (
                        <div className="space-y-1">
                          <div className="font-semibold text-[#0f172a]">{request.contactName}</div>
                          <div className="text-xs text-[#64748b]">{request.contactEmail}</div>
                          <div className="text-xs text-[#64748b]">{request.contactPhone}</div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-sm text-[#475569]">
                          <span className="table-chip warning inline-flex items-center gap-2">
                            <span className="text-base leading-none">🔒</span> Contatti bloccati
                          </span>
                          <p className="text-xs text-[#64748b]">Attiva l’abbonamento per vedere i referenti.</p>
                        </div>
                      )}
                    </td>
                    <td className="text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </section>
  );
}
