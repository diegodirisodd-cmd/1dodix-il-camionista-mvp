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
      take: 5,
    }),
    prisma.request.count(),
  ]);

  const subscriptionActive = user.subscriptionActive;

  return (
    <section className="space-y-6">
      {!subscriptionActive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
          Per sbloccare contatti e briefing completi attiva l’abbonamento dalla sezione dedicata.
        </div>
      )}

      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">Dashboard Trasportatore</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Consulta gli incarichi delle aziende verificate, scegli i carichi pertinenti e mantieni l’accesso ai contatti.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Stato</p>
          <h2 className="text-lg font-semibold text-slate-900">Abbonamento</h2>
          <p className="text-3xl font-semibold text-slate-900">{subscriptionActive ? "Attivo" : "Non attivo"}</p>
          <p className="text-sm leading-relaxed text-slate-600">
            {subscriptionActive
              ? "Contatti e briefing disponibili."
              : "Contatti oscurati finché non attivi l’abbonamento."}
          </p>
        </div>

        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Richieste</p>
          <h2 className="text-lg font-semibold text-slate-900">Carichi disponibili</h2>
          <p className="text-3xl font-semibold text-slate-900">{availableLoads}</p>
          <p className="text-sm leading-relaxed text-slate-600">Incarichi pubblicati dalle aziende registrate.</p>
        </div>

        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Azione rapida</p>
          <h2 className="text-lg font-semibold text-slate-900">Vedi richieste</h2>
          <p className="text-sm leading-relaxed text-slate-600">Apri l’elenco completo per scegliere le tratte più adatte.</p>
          <a className="btn btn-primary w-full justify-center" href="/dashboard/transporter/requests">
            Vedi richieste
          </a>
        </div>
      </div>

      <SectionCard
        title="Accesso e abbonamento"
        description="Cosa sblocchi con il pagamento e cosa rimane oscurato."
        className="grid gap-4 lg:grid-cols-2"
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Cosa sblocchi</p>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-800">
            <li>Contatti completi delle aziende (telefono, email, referente).</li>
            <li>Briefing operativi con percorso, finestra e carico chiariti.</li>
            <li>Priorità nelle conferme per profili verificati.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Senza pagamento</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">Accesso limitato</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Titoli e percorsi restano consultabili, ma i contatti sono oscurati finché non attivi l’abbonamento.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a className="btn btn-primary" href="/paywall">
              Attiva abbonamento
            </a>
            <a className="btn btn-secondary" href="/dashboard/transporter/requests">
              Consulta i carichi
            </a>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Richieste recenti"
        description="Ultime pubblicazioni dalle aziende registrate."
        className="space-y-4"
      >
        {recentRequests.length === 0 ? (
          <p className="text-sm leading-relaxed text-slate-600">Nessuna richiesta disponibile al momento.</p>
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
                    <td className="text-slate-800">
                      <span className="font-semibold text-slate-900">{request.pickup}</span> → {request.dropoff}
                    </td>
                    <td className="text-slate-800">{request.cargo ?? "—"}</td>
                    <td className="text-slate-800">{request.budget ?? "—"}</td>
                    <td className="text-slate-800">
                      {subscriptionActive ? (
                        <div className="space-y-1 text-slate-800">
                          <div className="font-semibold text-slate-900">{request.contactName}</div>
                          <div className="text-xs text-slate-600">{request.contactEmail}</div>
                          <div className="text-xs text-slate-600">{request.contactPhone}</div>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-slate-600">Contatti bloccati</span>
                      )}
                    </td>
                    <td className="text-slate-800">
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
