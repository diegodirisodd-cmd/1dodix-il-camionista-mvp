import { RequestForm } from "@/components/dashboard/request-form";
import { SectionCard } from "@/components/dashboard/section-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CompanyDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const companyRequests = await prisma.request.findMany({
    where: { companyId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">Area riservata aziende</p>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard Azienda</h1>
        <p className="text-slate-700">
          Pubblica nuove richieste di trasporto e consulta lo storico inviato ai trasportatori registrati.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Profilo azienda">
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
          title="Operatività"
          description="Metriche live sulle richieste pubblicate."
          actions={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Live</span>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Richieste attive</p>
              <p className="text-2xl font-semibold text-slate-900">{companyRequests.length}</p>
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Ultima pubblicazione</p>
              <p className="text-lg font-semibold text-slate-900">
                {companyRequests[0]
                  ? new Date(companyRequests[0].createdAt).toLocaleDateString("it-IT")
                  : "Nessuna"}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Pubblica una richiesta"
          description="Crea una nuova spedizione e inviala ai trasportatori registrati."
        >
          <RequestForm />
        </SectionCard>
      </section>

      <SectionCard
        title="Richieste inviate"
        description="Storico delle richieste di trasporto pubblicate."
        actions={<span className="text-sm text-slate-500">{companyRequests.length} richieste</span>}
      >
        {companyRequests.length === 0 ? (
          <p className="text-sm text-slate-600">Pubblica la prima richiesta per contattare i trasportatori disponibili.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Titolo</th>
                  <th className="px-4 py-3 font-semibold">Percorso</th>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">Contatto</th>
                  <th className="px-4 py-3 font-semibold">Pubblicata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companyRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{request.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.budget ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">{request.contactName}</div>
                        <div className="text-slate-700">{request.contactPhone}</div>
                        <div className="text-slate-700">{request.contactEmail}</div>
                      </div>
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
