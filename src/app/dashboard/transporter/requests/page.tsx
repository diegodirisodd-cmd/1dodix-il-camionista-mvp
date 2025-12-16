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

  const displayRequests = requests.map((request) => maskContact(user.subscriptionActive, request));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">Richieste disponibili</p>
        <h1 className="text-3xl font-semibold text-slate-900">Trasporti pubblicati</h1>
        <p className="text-slate-700">
          Visualizza le richieste inviate dalle aziende registrate. I dettagli di contatto sono visibili solo con un
          abbonamento attivo.
        </p>
      </header>

      <SectionCard
        title="Richieste"
        description="Elenco aggiornato in ordine cronologico"
        actions={
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {displayRequests.length} richieste
          </span>
        }
      >
        {displayRequests.length === 0 ? (
          <p className="text-sm text-slate-600">Nessuna richiesta presente. Torna a controllare più tardi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Titolo</th>
                  <th className="px-4 py-3 font-semibold">Azienda</th>
                  <th className="px-4 py-3 font-semibold">Percorso</th>
                  <th className="px-4 py-3 font-semibold">Carico</th>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">Contatto</th>
                  <th className="px-4 py-3 font-semibold">Pubblicata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{request.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.company.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.cargo ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.budget ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-800">
                      {request.contactName ? (
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">{request.contactName}</div>
                          <div className="text-slate-700">{request.contactPhone}</div>
                          <div className="text-slate-700">{request.contactEmail}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">
                          Abbonamento necessario per vedere i contatti
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      {new Date(request.createdAt).toLocaleDateString("it-IT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
