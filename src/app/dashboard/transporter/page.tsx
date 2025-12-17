import type { Request as RequestModel } from "@prisma/client";

import { SectionCard } from "@/components/dashboard/section-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type RequestWithCompany = RequestModel & { company: { email: string } };

export default async function TransporterDashboardPage() {
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

  const subscriptionActive = user.subscriptionActive;
  const recentRequests: RequestWithCompany[] = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { email: true } } },
    take: 5,
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">Area riservata trasportatori</p>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard Trasportatore</h1>
        <p className="text-slate-700">
          Profilo, riepilogo abbonamento e ultime richieste pubblicate dalle aziende. I contatti sono visibili solo con
          abbonamento attivo.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Profilo">
          <dl className="space-y-2 text-sm text-slate-700">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Ruolo</dt>
              <dd className="font-medium text-slate-900">{user.role}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Iscritto</dt>
              <dd className="font-medium text-slate-900">
                {new Date(user.createdAt).toLocaleDateString("it-IT")}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Abbonamento"
          description="I dettagli di contatto delle aziende sono visibili solo con un abbonamento attivo."
          actions={
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                subscriptionActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {subscriptionActive ? "Attivo" : "Non attivo"}
            </span>
          }
        >
          {!subscriptionActive && (
            <div className="flex flex-wrap gap-2 text-sm">
              <button className="rounded-md bg-slate-900 px-3 py-2 text-white">Attiva ora</button>
              <button className="rounded-md border border-slate-200 px-3 py-2 text-slate-800">
                Contatta l&apos;assistenza
              </button>
            </div>
          )}
        </SectionCard>
      </section>

      <SectionCard
        title="Ultime richieste"
        description="Gli ultimi incarichi pubblicati dalle aziende registrate."
        actions={
          <a className="text-sm font-semibold text-slate-900" href="/dashboard/transporter/requests">
            Vedi tutte
          </a>
        }
      >
        {recentRequests.length === 0 ? (
          <p className="text-sm text-slate-600">Ancora nessuna richiesta pubblicata.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Titolo</th>
                  <th className="px-4 py-3 font-semibold">Percorso</th>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">Contatti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{request.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.budget ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-800">
                      {subscriptionActive ? (
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold text-slate-900">{request.contactName}</div>
                          <div className="text-slate-700">{request.contactPhone}</div>
                          <div className="text-slate-700">{request.contactEmail}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">Attiva l&apos;abbonamento per sbloccare i contatti</div>
                      )}
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
