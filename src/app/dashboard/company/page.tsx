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

  if (!user.subscriptionActive) {
    redirect("/paywall");
  }

  const [companyRequests, verifiedTransporters] = await Promise.all([
    prisma.request.findMany({
      where: { companyId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({
      where: { role: "TRANSPORTER", subscriptionActive: true },
    }),
  ]);

  const activeRequests = companyRequests.length;
  const lastPublication = companyRequests[0]
    ? new Date(companyRequests[0].createdAt).toLocaleDateString("it-IT")
    : "Nessuna";
  const recentContacts = companyRequests.slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white/60 p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Area aziende</p>
            <h1 className="text-3xl font-semibold text-slate-900">Centro operativo aziendale</h1>
            <p className="text-slate-700">Stato richieste, trasportatori verificati e abbonamento in un unico cruscotto.</p>
          </div>
          <a
            href="#pubblica"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Pubblica una richiesta
            <span aria-hidden>→</span>
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SectionCard title="Richieste attive" description="Annunci pubblicati e visibili ai trasportatori." subtle>
            <p className="text-4xl font-semibold text-slate-900">{activeRequests}</p>
            <p className="text-sm text-slate-600">Ultima pubblicazione: {lastPublication}</p>
          </SectionCard>
          <SectionCard title="Trasportatori verificati" description="Iscritti con abbonamento attivo." subtle>
            <p className="text-4xl font-semibold text-slate-900">{verifiedTransporters}</p>
            <p className="text-sm text-slate-600">Disponibili per assegnazione immediata</p>
          </SectionCard>
          <SectionCard title="Abbonamento" description="Stato attuale dell’account." subtle>
            <p className="text-lg font-semibold text-emerald-600">Attivo</p>
            <p className="text-sm text-slate-600">Accesso completo a contatti e documenti</p>
          </SectionCard>
          <SectionCard title="Contatti recenti" description="Lead generati dalle ultime richieste." subtle>
            <p className="text-4xl font-semibold text-slate-900">{recentContacts.length}</p>
            <p className="text-sm text-slate-600">Ultime richieste in evidenza</p>
          </SectionCard>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Profilo azienda" description="Dati account e onboarding." className="lg:col-span-1">
          <dl className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500">Ruolo</dt>
              <dd className="font-medium text-slate-900">{user.role}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500">Iscritto dal</dt>
              <dd className="font-medium text-slate-900">
                {new Date(user.createdAt).toLocaleDateString("it-IT")}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500">Stato abbonamento</dt>
              <dd className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Attivo
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Richieste in corso"
          description="Monitoraggio operativo delle spedizioni aperte."
          actions={
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {activeRequests} attive
            </span>
          }
          className="lg:col-span-2"
        >
          {companyRequests.length === 0 ? (
            <p className="text-sm text-slate-600">Pubblica la prima richiesta per ingaggiare trasportatori verificati.</p>
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
      </section>

      <section className="grid gap-6 lg:grid-cols-3" id="pubblica">
        <SectionCard
          title="Contatti recenti"
          description="Contatti condivisi con trasportatori dagli ultimi incarichi pubblicati."
          className="lg:col-span-2"
        >
          {recentContacts.length === 0 ? (
            <p className="text-sm text-slate-600">Nessun contatto generato finora.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Richiesta</th>
                    <th className="px-4 py-3 font-semibold">Contatto</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Telefono</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentContacts.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{request.title}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.contactName}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.contactEmail}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.contactPhone}</td>
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

        <SectionCard
          title="Pubblica una nuova richiesta"
          description="Inserisci dati completi per assegnare rapidamente ai trasportatori verificati."
        >
          <RequestForm />
        </SectionCard>
      </section>
    </div>
  );
}
