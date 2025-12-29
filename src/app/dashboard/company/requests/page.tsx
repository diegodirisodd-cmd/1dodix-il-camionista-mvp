import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CompanyRequestsPage({ searchParams }: { searchParams?: { created?: string } }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const showCreated = searchParams?.created === "1";
  const companyRequests = await prisma.request.findMany({
    where: { companyId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-6">
      {showCreated && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
          Richiesta creata correttamente. Gestiscila dall&apos;elenco qui sotto.
        </div>
      )}

      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Richieste inviate</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Pubblica, monitora e aggiorna le spedizioni</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Tutte le tue richieste di trasporto in un unico posto, pronte per contattare trasportatori verificati.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/company/new-request" className="btn btn-primary">
            Pubblica una nuova spedizione
          </Link>
          <p className="text-xs text-[#64748b]">Le richieste sono visibili solo a trasportatori registrati.</p>
        </div>
      </div>

      {companyRequests.length === 0 ? (
        <div className="card text-sm leading-relaxed text-[#475569]">
          Nessuna richiesta presente. Pubblica la prima per ricevere contatti diretti.
        </div>
      ) : (
        <div className="card space-y-3">
          <div className="table-shell overflow-x-auto">
            <table className="min-w-[980px]">
              <thead>
                <tr>
                  <th>Titolo</th>
                  <th>Percorso</th>
                  <th>Carico</th>
                  <th>Budget</th>
                  <th>Contatto</th>
                  <th>Pubblicata</th>
                </tr>
              </thead>
              <tbody>
                {companyRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="font-semibold text-[#0f172a]">{request.title}</td>
                    <td className="text-[#475569]">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                    <td className="text-[#475569]">{request.budget ?? "—"}</td>
                    <td className="space-y-1 text-[#475569]">
                      <div className="font-semibold text-[#0f172a]">{request.contactName}</div>
                      <div className="text-xs text-[#64748b]">{request.contactEmail}</div>
                      <div className="text-xs text-[#64748b]">{request.contactPhone}</div>
                    </td>
                    <td className="text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
