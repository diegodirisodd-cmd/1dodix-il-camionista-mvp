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

  if (!user.subscriptionActive) {
    redirect("/paywall");
  }

  const requests: RequestWithCompany[] = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { email: true } } },
  });

  const displayRequests = requests.map((request) => maskContact(user.subscriptionActive, request));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Richieste disponibili</p>
        <h1>Trasporti pubblicati</h1>
        <p>
          Visualizza le richieste inviate dalle aziende registrate. I dettagli di contatto sono visibili solo con un
          abbonamento attivo.
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
          <p className="text-sm text-neutral-700">Nessuna richiesta presente. Torna a controllare più tardi.</p>
        ) : (
          <div className="table-shell overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Titolo</th>
                  <th>Azienda</th>
                  <th>Percorso</th>
                  <th>Carico</th>
                  <th>Budget</th>
                  <th>Contatto</th>
                  <th>Pubblicata</th>
                </tr>
              </thead>
              <tbody>
                {displayRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap font-semibold text-brand-900">{request.title}</td>
                    <td className="whitespace-nowrap">{request.company.email}</td>
                    <td className="whitespace-nowrap">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="whitespace-nowrap">{request.cargo ?? "-"}</td>
                    <td className="whitespace-nowrap">{request.budget ?? "-"}</td>
                    <td>
                      {request.contactName ? (
                        <div className="space-y-1">
                          <div className="font-semibold text-brand-900">{request.contactName}</div>
                          <div className="text-neutral-700">{request.contactPhone}</div>
                          <div className="text-neutral-700">{request.contactEmail}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-neutral-600">
                          Abbonamento necessario per vedere i contatti
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-neutral-700">
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
