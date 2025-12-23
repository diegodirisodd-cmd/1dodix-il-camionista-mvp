import { SectionCard } from "@/components/dashboard/section-card";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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
      take: 6,
    }),
    prisma.request.count(),
  ]);

  const subscriptionActive = user.subscriptionActive;

  return (
    <section className="space-y-6">
      <div className="card space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Panoramica profilo</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Trova nuovi incarichi di trasporto</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Accedi a richieste reali pubblicate da aziende operative nel tuo settore.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" />
        </div>
        {!subscriptionActive && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[#475569] shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="leading-relaxed text-slate-800">
                Senza abbonamento puoi visualizzare solo i dettagli generali. Attiva l’accesso per vedere i contatti.
              </p>
              <a
                className="btn btn-primary w-full justify-center sm:w-auto"
                href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
                target="_blank"
                rel="noopener noreferrer"
              >
                Attiva accesso completo
              </a>
            </div>
            <p className="mt-2 text-xs font-medium text-[#475569]">
              Sblocca contatti diretti, richieste illimitate e priorità di visibilità.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f172a]">Stato accesso</p>
          <h2 className="text-xl font-semibold text-[#0f172a]">Abbonamento</h2>
          <p className="text-lg font-semibold text-[#0f172a]">
            {subscriptionActive ? "Abbonamento attivo" : "Abbonamento non attivo"}
          </p>
          <p className="text-sm leading-relaxed text-[#475569]">
            {subscriptionActive
              ? "Hai accesso completo ai contatti aziendali."
              : "Attiva l’abbonamento per contattare direttamente le aziende."}
          </p>
        </div>
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f172a]">Richieste disponibili</p>
          <h2 className="text-xl font-semibold text-[#0f172a]">Carichi pubblicati</h2>
          <p className="text-3xl font-semibold text-[#0f172a]">{availableLoads}</p>
          <p className="text-sm leading-relaxed text-[#475569]">Solo richieste reali, pubblicate da aziende registrate.</p>
          <a className="btn btn-secondary w-full justify-center" href="/dashboard/transporter/requests">
            Vedi richieste
          </a>
          <p className="text-xs text-[#64748b]">Contatti sbloccati con abbonamento attivo.</p>
        </div>
      </div>

      <SectionCard
        title="Richieste disponibili ora"
        description="Solo richieste reali, pubblicate da aziende registrate."
        className="space-y-4"
      >
        {recentRequests.length === 0 ? (
          <p className="text-sm leading-relaxed text-slate-700">Nessuna richiesta disponibile al momento.</p>
        ) : (
          <div className="table-shell overflow-x-auto">
            <table className="min-w-[900px]">
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
                {recentRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="text-[#475569]">
                      <span className="font-semibold text-[#0f172a]">{request.pickup}</span> → {request.dropoff}
                    </td>
                    <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                    <td className="text-[#475569]">{request.budget ?? "—"}</td>
                    <td className="text-[#475569]">
                      {subscriptionActive ? (
                        <div className="space-y-1 text-[#475569]">
                          <div className="font-semibold text-[#0f172a]">{request.contactName}</div>
                          <div className="text-xs text-[#64748b]">{request.contactEmail}</div>
                          <div className="text-xs text-[#64748b]">{request.contactPhone}</div>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-[#475569]">Contatti bloccati</span>
                      )}
                    </td>
                    <td className="text-[#475569]">
                      {new Date(request.createdAt).toLocaleDateString("it-IT")}
                    </td>
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
