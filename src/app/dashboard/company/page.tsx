import Link from "next/link";
import { RequestForm } from "@/components/dashboard/request-form";
import { SectionCard } from "@/components/dashboard/section-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CompanyDashboardPage({
  searchParams,
}: {
  searchParams?: { created?: string };
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const isSubscribed = user.subscriptionActive;

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
  const showCreatedBanner = searchParams?.created === "1";
  const subscriptionLabel = isSubscribed ? "Attivo" : "Non attivo";
  const subscriptionBadgeClass = isSubscribed
    ? "bg-success/10 text-success"
    : "bg-accent-500/15 text-accent-50";
  const publishHref = isSubscribed ? "#pubblica" : "/paywall";
  const publishCtaLabel = isSubscribed
    ? "Apri il form di pubblicazione"
    : "Attiva l’abbonamento per pubblicare";

  return (
    <div className="space-y-10">
      {showCreatedBanner && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success shadow-sm">
          Richiesta creata correttamente. Puoi gestirla qui nella dashboard.
        </div>
      )}
      {!isSubscribed && (
        <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-sm text-accent-50 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-accent-100">
              Per pubblicare nuove richieste e condividere contatti è necessario attivare l’abbonamento.
            </p>
            <Link
              href="/paywall"
              className="btn-primary inline-flex w-full justify-center px-4 py-2 text-sm font-semibold sm:w-auto"
            >
              Attiva abbonamento
            </Link>
          </div>
        </div>
      )}
      <header className="space-y-5 lg:space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-900/20 px-4 py-2 text-xs font-semibold text-brand-50 ring-1 ring-brand-900/30">
            <span className="rounded-full bg-accent-500/20 px-3 py-1 text-accent-100">Azienda</span>
            <span className="text-brand-50">{user.email}</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold leading-tight text-white lg:text-4xl">
              Dashboard Azienda
            </h1>
            <p className="max-w-3xl text-base text-neutral-100/80 lg:text-lg">
              Pianifica incarichi di trasporto, ricevi risposte da trasportatori verificati e governa i contatti in modo diretto e documentato.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SectionCard
            title="Profilo azienda"
            description="Dati essenziali per verifiche e onboarding con i partner."
            subtle
          >
            <dl className="space-y-3 text-sm text-neutral-100/80">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-neutral-300">Email</dt>
                <dd className="font-semibold text-white">{user.email}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-neutral-300">Ruolo</dt>
                <dd className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase text-white">{user.role}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-neutral-300">Iscritto dal</dt>
                <dd className="font-semibold text-white">
                  {new Date(user.createdAt).toLocaleDateString("it-IT")}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg bg-white/5 px-4 py-3 text-xs text-neutral-100/70">
              Mantieni le informazioni aziendali aggiornate per velocizzare gli accordi con i trasportatori.
            </div>
          </SectionCard>

          <SectionCard
            title="Richieste attive"
            description="Incarichi pubblicati e visibili ai trasportatori verificati."
            subtle
          >
            <div className="flex items-end justify-between gap-3">
              <p className="text-5xl font-semibold text-white">{activeRequests}</p>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Aggiornato</span>
            </div>
            <p className="text-sm text-neutral-200/80">Ultima pubblicazione: {lastPublication}</p>
          </SectionCard>

          <SectionCard
            title="Pubblica nuova richiesta"
            description="Invia un brief completo per ricevere proposte rapide."
            subtle
          >
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-100/80">
                Definisci percorso, finestra, carico e contatti per attivare subito i trasportatori verificati.
              </p>
              <a
                href={publishHref}
                className="btn-primary w-full justify-center px-4 py-3 text-base shadow-lg shadow-brand-900/30"
              >
                {publishCtaLabel}
              </a>
              <p className="text-xs text-neutral-200/80">
                {isSubscribed
                  ? "Il pulsante ti porta direttamente al modulo da completare."
                  : "Servono pochi secondi per attivare l’abbonamento e pubblicare."}
              </p>
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
              <dd
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${subscriptionBadgeClass}`}
              >
                {subscriptionLabel}
              </dd>
            </div>
          </dl>
          <div className="mt-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-neutral-100/70 shadow-inner">
            Mantieni i dati aggiornati per velocizzare la firma dei contratti e l’assegnazione dei carichi.
          </div>
        </SectionCard>

        <SectionCard
          title="Richieste in corso"
          description="Monitoraggio delle spedizioni aperte e dei contatti condivisi."
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
            <div className="table-shell overflow-x-auto">
              <table className="min-w-[980px]">
                <thead>
                  <tr>
                    <th>Titolo</th>
                    <th>Percorso</th>
                    <th>Finestra</th>
                    <th>Carico</th>
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
                      <td className="whitespace-nowrap text-neutral-100/80">{request.timeWindow}</td>
                      <td className="whitespace-nowrap text-neutral-100/80">
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{request.cargoType}</div>
                          <div className="text-xs text-neutral-200/80">{request.estimatedWeight}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-neutral-100/80">
                        <div className="space-y-1 text-sm">
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
          description="Recapiti condivisi con i trasportatori dagli ultimi incarichi pubblicati."
          className="xl:col-span-2"
        >
          {recentContacts.length === 0 ? (
            <p className="text-sm text-neutral-200/80">Nessun contatto generato finora.</p>
          ) : (
            <div className="table-shell overflow-x-auto">
              <table className="min-w-[760px]">
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
          description="Compila il brief operativo per attivare i trasportatori verificati."
          id="pubblica"
        >
          {isSubscribed ? (
            <RequestForm />
          ) : (
            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-100/80">
              <p>
                Attiva l’abbonamento per compilare il modulo e inviare nuove richieste ai trasportatori verificati.
              </p>
              <Link href="/paywall" className="btn-primary inline-flex w-full justify-center px-4 py-2 text-sm font-semibold">
                Vai al paywall
              </Link>
            </div>
          )}
        </SectionCard>
      </section>
    </div>
  );
}
