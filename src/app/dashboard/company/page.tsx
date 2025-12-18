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
    <div className="space-y-10">
      <header className="card space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-100 shadow-sm shadow-black/20 ring-1 ring-white/10">
              <span className="rounded-full bg-accent-500/20 px-3 py-1 text-accent-200">Azienda</span>
              <span className="text-white">Dashboard operativa</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-tight text-white lg:text-4xl">
                Controllo totale su richieste e trasportatori verificati
              </h1>
              <p className="max-w-3xl text-neutral-100/80">
                Monitora richieste attive, contatta trasportatori verificati e mantieni abbonamento sempre
                operativo. Tutto in una vista pronta per le demo commerciali.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-100/80">
              <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                Abbonamento attivo
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                Ultima pubblicazione: {lastPublication}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <a href="#pubblica" className="btn-primary px-6 py-3 text-base">
              Pubblica una richiesta
              <span aria-hidden>→</span>
            </a>
            <p className="text-sm text-neutral-100/70">Raggiungi trasportatori verificati in pochi minuti.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SectionCard title="Richieste attive" description="Annunci pubblicati e visibili ai trasportatori." subtle>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-semibold text-white">{activeRequests}</p>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-100/80">
                In evidenza
              </span>
            </div>
            <p className="text-sm text-neutral-200/80">Ultima pubblicazione: {lastPublication}</p>
          </SectionCard>
          <SectionCard title="Trasportatori verificati" description="Iscritti con abbonamento attivo." subtle>
            <p className="text-4xl font-semibold text-white">{verifiedTransporters}</p>
            <p className="text-sm text-neutral-200/80">Disponibili per assegnazione immediata</p>
          </SectionCard>
          <SectionCard title="Abbonamento" description="Stato attuale dell’account." subtle>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-success">Attivo</p>
              <p className="text-sm text-neutral-200/80">Accesso completo a contatti e documenti.</p>
            </div>
          </SectionCard>
          <SectionCard title="Contatti recenti" description="Lead generati dalle ultime richieste." subtle>
            <div className="space-y-2">
              <p className="text-4xl font-semibold text-white">{recentContacts.length}</p>
              <p className="text-sm text-neutral-200/80">Monitorati per follow-up commerciale.</p>
            </div>
          </SectionCard>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Profilo azienda"
          description="Dettagli account sempre disponibili per le verifiche commerciali."
          className="xl:col-span-1"
        >
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
          <div className="mt-4 rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-xs text-neutral-100/70">
            Mantieni i dati aggiornati per velocizzare la firma dei contratti e l’assegnazione dei carichi.
          </div>
        </SectionCard>

        <SectionCard
          title="Richieste in corso"
          description="Monitoraggio operativo delle spedizioni aperte e dei contatti condivisi."
          actions={
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-100">
              {activeRequests} attive
            </span>
          }
          className="xl:col-span-2"
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

      <section className="grid gap-6 xl:grid-cols-3" id="pubblica">
        <SectionCard
          title="Contatti recenti"
          description="Contatti condivisi con trasportatori dagli ultimi incarichi pubblicati."
          className="xl:col-span-2"
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
