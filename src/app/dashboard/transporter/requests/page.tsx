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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Richieste disponibili</p>
        <h1>Trasporti pubblicati</h1>
        <p className="text-neutral-100/80">Richieste inviate da aziende registrate. I contatti sono visibili solo con un abbonamento attivo.</p>
      </header>

      <SectionCard
        title="Richieste"
        description="Elenco aggiornato in ordine cronologico"
        actions={
          <span className="badge">{displayRequests.length} richieste</span>
        }
      >
        {displayRequests.length === 0 ? (
          <p className="text-sm text-neutral-200/80">Nessuna richiesta presente. Torna a controllare più tardi.</p>
        ) : (
          <div className="table-shell overflow-x-auto">
            <table className="min-w-[960px]">
              <thead>
                <tr>
                  <th>Titolo</th>
                  <th>Azienda</th>
                  <th>Percorso</th>
                  <th>Carico</th>
                  <th>Budget</th>
                  <th>Contatto</th>
                  <th className="text-right">Pubblicata</th>
                </tr>
              </thead>
              <tbody>
                {displayRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap font-semibold text-white">{request.title}</td>
                    <td className="whitespace-nowrap text-neutral-100/80">{request.company.email}</td>
                    <td className="whitespace-nowrap text-neutral-100/80">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="whitespace-nowrap text-neutral-100/80">{request.cargo ?? "-"}</td>
                    <td className="whitespace-nowrap font-semibold text-white">{request.budget ?? "-"}</td>
                    <td className="text-neutral-100/80">
                      {request.contactName ? (
                        <div className="space-y-2">
                          <span className="table-chip success">Contatti sbloccati</span>
                          <div className="space-y-1 text-sm">
                            <div className="font-semibold text-white">{request.contactName}</div>
                            <div className="text-neutral-200/80">{request.contactPhone}</div>
                            <div className="text-neutral-200/80">{request.contactEmail}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm text-neutral-200/80">
                          <span className="table-chip warning">Contatti bloccati</span>
                          <p className="leading-snug">Attiva l&apos;abbonamento per vedere i recapiti e chiamare subito.</p>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-right text-neutral-200/80">
                      <div className="table-meta">{new Date(request.createdAt).toLocaleDateString("it-IT")}</div>
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
