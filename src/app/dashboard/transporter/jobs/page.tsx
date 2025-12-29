import Link from "next/link";
import { redirect } from "next/navigation";
import type { Request as RequestModel } from "@prisma/client";

import { SectionCard } from "@/components/dashboard/section-card";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { billingDestinationForRole, hasActiveSubscription } from "@/lib/subscription";

type RequestWithCompany = RequestModel & { company: { email: string } };

function maskContact(subscriptionActive: boolean, request: RequestWithCompany) {
  if (subscriptionActive) return request;

  const { contactName, contactPhone, contactEmail, ...rest } = request;
  return {
    ...rest,
    contactName: contactName ? "Referente nascosto" : null,
    contactPhone: contactPhone ? "••••••" : null,
    contactEmail: contactEmail ? "••••@••••" : null,
  };
}

export default async function TransporterJobsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  const requests: RequestWithCompany[] = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { email: true } } },
  });

  const subscriptionActive = hasActiveSubscription(user);
  const displayRequests = requests.map((request) => maskContact(subscriptionActive, request));
  const billingPath = billingDestinationForRole(user.role);

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Richieste disponibili</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Nuovi trasporti pronti da prendere in carico</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Consulta le tratte pubblicate dalle aziende registrate. I contatti restano protetti finché l’abbonamento non è attivo.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" role={user.role} />
        </div>
      </div>

      {!subscriptionActive && (
        <div className="relative overflow-hidden rounded-2xl border border-[#f5c76a] bg-white p-6 shadow-sm">
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#fff8ed] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#92400e] ring-1 ring-[#f5c76a]">
            Accesso limitato
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[#0f172a]">Sblocca l’accesso completo</h2>
            <p className="text-sm leading-relaxed text-[#475569]">
              Con l’accesso completo puoi contattare subito le aziende e rispondere alle richieste reali.
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-[#475569]">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#f5a524]">•</span> Contatti diretti senza intermediari
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#f5a524]">•</span> Richieste illimitate e prioritarie
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#f5a524]">•</span> Risposte rapide ai referenti aziendali
              </li>
            </ul>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Link
                href={billingPath}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#f5c76a] to-[#f29f58] px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:brightness-95 sm:w-auto"
              >
                Attiva accesso completo
              </Link>
              <Link
                href={billingPath}
                className="text-sm font-semibold text-[#0f172a] underline-offset-4 hover:underline"
              >
                Scopri cosa sblocchi
              </Link>
            </div>
            <p className="text-xs font-medium text-[#64748b]">Pagamenti sicuri con Stripe · Disdici quando vuoi</p>
          </div>
        </div>
      )}

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
                  <tr key={request.id} className={!subscriptionActive ? "bg-white/70" : undefined}>
                    <td className="text-[#475569]">
                      <span className="font-semibold text-[#0f172a]">{request.pickup}</span> → {request.dropoff}
                    </td>
                    <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                    <td className="text-[#475569]">{request.budget ?? "—"}</td>
                    <td className="text-[#475569]">
                      {subscriptionActive && request.contactName ? (
                        <div className="space-y-1">
                          <div className="font-semibold text-[#0f172a]">{request.contactName}</div>
                          <div className="text-xs text-[#64748b]">{request.contactEmail}</div>
                          <div className="text-xs text-[#64748b]">{request.contactPhone}</div>
                        </div>
                      ) : (
                        <div className="space-y-2 rounded-lg border border-dashed border-[#f5c76a]/80 bg-[#fff8ed] p-3 text-sm text-[#475569]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="table-chip warning inline-flex items-center gap-2">
                              <span className="text-base leading-none">🔒</span> Accesso limitato
                            </span>
                            <Link
                              href={billingPath}
                              className="text-xs font-semibold text-[#0f172a] underline-offset-4 hover:underline"
                            >
                              Sblocca contatti e richieste
                            </Link>
                          </div>
                          <div className="text-xs text-[#64748b]">
                            Contatti sfocati fino all’attivazione dell’accesso completo.
                          </div>
                          <div className="space-y-1 text-xs text-[#475569]">
                            <div className="blur-[1px]">{request.contactName ?? "Referente nascosto"}</div>
                            <div className="blur-[1px]">{request.contactEmail ?? "••••@••••"}</div>
                            <div className="blur-[1px]">{request.contactPhone ?? "••••••"}</div>
                          </div>
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
