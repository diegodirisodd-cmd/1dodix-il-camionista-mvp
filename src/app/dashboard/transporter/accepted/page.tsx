import Link from "next/link";
import { redirect } from "next/navigation";

import { formatCurrency } from "@/lib/commission";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TransporterAcceptedPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  const acceptedRequests = await prisma.request.findMany({
    where: { transporterId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      pickup: true,
      delivery: true,
      price: true,
      createdAt: true,
      company: { select: { email: true } },
    },
  });

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Trasporti accettati</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Le tue richieste già prese in carico</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Qui trovi l&apos;elenco delle tratte che hai accettato, con lo stato sempre aggiornato.
            </p>
          </div>
        </div>
      </div>

      {acceptedRequests.length === 0 ? (
        <div className="card text-sm leading-relaxed text-[#475569]">
          Non hai ancora accettato nessun trasporto.
        </div>
      ) : (
        <div className="table-shell overflow-x-auto">
          <table className="min-w-[960px]">
            <thead>
              <tr>
                <th>Percorso</th>
                <th>Azienda</th>
                <th>Budget</th>
                <th>Stato</th>
                <th>Pubblicata</th>
              </tr>
            </thead>
            <tbody>
              {acceptedRequests.map((request) => {
                const detailHref = `/dashboard/transporter/requests/${request.id}`;
                return (
                  <tr key={request.id} className="cursor-pointer">
                    <td className="text-[#475569]">
                      <Link href={detailHref} className="font-semibold text-[#0f172a] hover:underline">
                        {request.pickup} → {request.delivery}
                      </Link>
                    </td>
                    <td className="text-[#475569]">{request.company.email}</td>
                    <td className="text-[#475569]">{formatCurrency(request.price)}</td>
                    <td className="text-[#475569]">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        Accettato
                      </span>
                    </td>
                    <td className="text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
