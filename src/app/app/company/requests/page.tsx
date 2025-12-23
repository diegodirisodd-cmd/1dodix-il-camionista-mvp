import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export default async function CompanyRequestsPage({
  searchParams,
}: {
  searchParams?: { created?: string };
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const requests = await prisma.request.findMany({
    where: { companyId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const showBanner = searchParams?.created === "1";

  return (
    <section className="space-y-6">
      {showBanner && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a] shadow-sm">
          Richiesta creata correttamente. Puoi gestirla da qui.
        </div>
      )}

      <div className="card space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Le tue richieste</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Storico completo delle spedizioni pubblicate dalla tua azienda.
            </p>
          </div>
          <Link href="/app/company/requests/new" className="btn-primary">
            Nuova richiesta
          </Link>
        </div>

        {requests.length === 0 ? (
          <p className="text-sm leading-relaxed text-[#475569]">Non hai ancora creato richieste.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] divide-y divide-[#e2e8f0] text-left text-sm text-[#0f172a]">
              <thead className="bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#475569]">
                <tr>
                  <th className="px-4 py-3">Titolo</th>
                  <th className="px-4 py-3">Percorso</th>
                  <th className="px-4 py-3">Carico</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Contatto</th>
                  <th className="px-4 py-3">Pubblicata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-sm text-[#0f172a]">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-semibold">{request.title}</td>
                    <td className="px-4 py-3 text-[#475569]">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="px-4 py-3 text-[#475569]">{request.cargo ?? "—"}</td>
                    <td className="px-4 py-3 text-[#475569]">{request.budget ?? "—"}</td>
                    <td className="px-4 py-3 text-[#475569]">
                      <div className="font-medium text-[#0f172a]">{request.contactName}</div>
                      <div className="text-xs text-[#64748b]">{request.contactEmail}</div>
                      <div className="text-xs text-[#64748b]">{request.contactPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
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
