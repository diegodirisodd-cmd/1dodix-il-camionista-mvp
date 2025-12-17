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
      <header className="card space-y-4 lg:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-300">Area aziende</p>
            <h1 className="text-3xl text-white">Centro operativo aziendale</h1>
            <p className="text-neutral-100/80">Stato richieste, trasportatori verificati e abbonamento in un unico cruscotto.</p>
          </div>
          <a href="#pubblica" className="btn-primary px-5 py-3 text-base">
            Pubblica una richiesta
            <span aria-hidden>→</span>
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SectionCard title="Richieste attive" description="Annunci pubblicati e visibili ai trasportatori." subtle>
            <p className="text-4xl font-semibold text-white">{activeRequests}</p>
            <p className="text-sm text-neutral-200/80">Ultima pubblicazione: {lastPublication}</p>
          </SectionCard>
          <SectionCard title="Trasportatori verificati" description="Iscritti con abbonamento attivo." subtle>
            <p className="text-4xl font-semibold text-white">{verifiedTransporters}</p>
            <p className="text-sm text-neutral-200/80">Disponibili per assegnazione immediata</p>
          </SectionCard>
          <SectionCard title="Abbonamento" description="Stato attuale dell’account." subtle>
            <p className="text-lg font-semibold text-success">Attivo</p>
            <p className="text-sm text-neutral-200/80">Accesso completo a contatti e documenti</p>
          </SectionCard>
          <SectionCard title="Contatti recenti" description="Lead generati dalle ultime richieste." subtle>
            <p className="text-4xl font-semibold text-white">{recentContacts.length}</p>
            <p className="text-sm text-neutral-200/80">Ultime richieste in evidenza</p>
          </SectionCard>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Profilo azienda" description="Dati account e onboarding." className="lg:col-span-1">
          <dl className="space-y-3 text-sm text-neutral-100/80">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-neutral-300">Email</dt>
              <dd className="font-medium text-white">{user.email}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-neutral-300">Ruolo</dt>
              <dd className="font-medium text-white">{user.role}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-neutral-300">Iscritto dal</dt>
              <dd className="font-medium text-white">
                {new Date(user.createdAt).toLocaleDateString("it-IT")}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-neutral-300">Stato abbonamento</dt>
              <dd className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                Attivo
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Richieste in corso"
          description="Monitoraggio operativo delle spedizioni aperte."
          actions={
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-100">
              {activeRequests} attive
            </span>
          }
          className="lg:col-span-2"
        >
          {companyRequests.length === 0 ? (
            <p className="text-sm text-neutral-200/80">Pubblica la prima richiesta per ingaggiare trasportatori verificati.</p>
          ) : (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Titolo</th>
                    <th>Percorso</th>
                    <th>Budget</th>
                    <th>Contatto</th>
                    <th>Pubblicata</th>
                  </tr>
                </thead>
                <tbody>
                  {companyRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="whitespace-nowrap font-semibold text-white">{request.title}</td>
                      <td className="whitespace-nowrap text-neutral-100/80">
                        {request.pickup} → {request.dropoff}
                      </td>
                      <td className="whitespace-nowrap text-neutral-100/80">{request.budget ?? "-"}</td>
                      <td className="whitespace-nowrap text-neutral-100/80">
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{request.contactName}</div>
                          <div className="text-neutral-200/80">{request.contactPhone}</div>
                          <div className="text-neutral-200/80">{request.contactEmail}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-neutral-100/80">
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
            <p className="text-sm text-neutral-200/80">Nessun contatto generato finora.</p>
          ) : (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Richiesta</th>
                    <th>Contatto</th>
                    <th>Email</th>
                    <th>Telefono</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContacts.map((request) => (
                    <tr key={request.id}>
                      <td className="whitespace-nowrap font-semibold text-white">{request.title}</td>
                      <td className="whitespace-nowrap text-neutral-100/80">{request.contactName}</td>
                      <td className="whitespace-nowrap text-neutral-100/80">{request.contactEmail}</td>
                      <td className="whitespace-nowrap text-neutral-100/80">{request.contactPhone}</td>
                      <td className="whitespace-nowrap text-neutral-100/80">
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
