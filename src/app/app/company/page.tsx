import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import { billingPathForRole, hasActiveSubscription } from "@/lib/subscription";

export default async function CompanyAppPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const companyRequests = await prisma.request.findMany({
    where: { companyId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const subscriptionActive = hasActiveSubscription(user);

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Azienda</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Trova trasportatori affidabili, senza intermediari</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Pubblica richieste di trasporto e ricevi contatti verificati. Gestisci tutto da un’unica area operativa.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} role={user.role} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#0f172a]">Crea richiesta</p>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Inserisci tratta, carico e contatti per ricevere disponibilità mirate.
            </p>
            <Link
              href={subscriptionActive ? "/app/company/requests/new" : "/dashboard/billing"}
              className="btn-primary mt-3 inline-flex w-full justify-center"
            >
              Crea nuova richiesta di spedizione
            </Link>
            {!subscriptionActive && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#fff8ed] px-3 py-1 text-[11px] font-semibold text-[#92400e] ring-1 ring-[#f5c76a]">
                Accesso limitato · sblocca per pubblicare
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#0f172a]">Le tue richieste</p>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Controlla lo stato delle spedizioni pubblicate e aggiorna i dettagli se necessario.
            </p>
            <Link href="/app/company/requests" className="btn-secondary mt-3 inline-flex w-full justify-center">
              Vedi richieste
            </Link>
          </div>

          <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#0f172a]">Profilo</p>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Aggiorna i dati aziendali e mantieni i contatti sempre disponibili e corretti.
            </p>
            <Link href="/app/company/profile" className="btn-secondary mt-3 inline-flex w-full justify-center">
              Vai al profilo
            </Link>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#0f172a]">Richieste recenti</h2>
            <p className="text-sm text-[#475569]">Ultime spedizioni pubblicate dalla tua azienda.</p>
          </div>
          <Link href="/app/company/requests/new" className="btn-primary">
            Nuova richiesta
          </Link>
        </div>

        {companyRequests.length === 0 ? (
          <p className="text-sm leading-relaxed text-[#475569]">Non hai ancora pubblicato richieste.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e2e8f0] text-left text-sm text-[#0f172a]">
              <thead className="bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#475569]">
                <tr>
                  <th className="px-4 py-3">Titolo</th>
                  <th className="px-4 py-3">Percorso</th>
                  <th className="px-4 py-3">Contatto</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-sm text-[#0f172a]">
                {companyRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-semibold">{request.title}</td>
                    <td className="px-4 py-3 text-[#475569]">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="px-4 py-3 text-[#475569]">
                      <div className="font-medium text-[#0f172a]">{request.contactName}</div>
                      <div className="text-xs text-[#64748b]">{request.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-[#475569]">
                      {new Date(request.createdAt).toLocaleDateString("it-IT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
