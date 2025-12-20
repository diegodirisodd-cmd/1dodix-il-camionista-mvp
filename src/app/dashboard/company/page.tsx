import Link from "next/link";
import { RequestForm } from "@/components/dashboard/request-form";
import { SectionCard } from "@/components/dashboard/section-card";
import { SubscriptionBadge } from "@/components/subscription-badge";
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
      where: { role: "TRANSPORTER" },
    }),
  ]);

  const activeRequests = companyRequests.length;
  const lastPublication = companyRequests[0]
    ? new Date(companyRequests[0].createdAt).toLocaleDateString("it-IT")
    : "Nessuna";
  const showCreatedBanner = searchParams?.created === "1";
  const publishHref = isSubscribed ? "#pubblica" : "/paywall";
  const publishCtaLabel = isSubscribed ? "Crea richiesta" : "Attiva abbonamento";

  return (
    <section className="space-y-6">
      {showCreatedBanner && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
          Richiesta creata correttamente. Puoi gestirla qui nella dashboard.
        </div>
      )}
      {!isSubscribed && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="leading-relaxed text-slate-800">
              Per pubblicare nuove richieste e condividere contatti è necessario attivare l’abbonamento.
            </p>
            <Link
              href="/paywall"
              className="btn btn-primary inline-flex w-full justify-center px-4 py-2 text-sm font-semibold sm:w-auto"
            >
              Attiva abbonamento
            </Link>
          </div>
        </div>
      )}

      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">Dashboard Azienda</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Pubblica incarichi, ricevi contatti di trasportatori verificati e gestisci tutto da un’unica area.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Profilo</p>
          <h2 className="text-lg font-semibold text-slate-900">Dati account</h2>
          <div className="space-y-2 text-sm leading-relaxed text-slate-800">
            <p>Email: {user.email}</p>
            <p>Ruolo: {user.role}</p>
            <p>Iscritto dal: {new Date(user.createdAt).toLocaleDateString("it-IT")}</p>
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Richieste</p>
          <h2 className="text-lg font-semibold text-slate-900">Incarichi attivi</h2>
          <p className="text-4xl font-semibold text-slate-900">{activeRequests}</p>
          <p className="text-sm text-slate-600">Ultima pubblicazione: {lastPublication}</p>
        </div>

        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Network</p>
          <h2 className="text-lg font-semibold text-slate-900">Trasportatori verificati</h2>
          <p className="text-4xl font-semibold text-slate-900">{verifiedTransporters}</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Carichi visibili a una rete di professionisti attivi sulla piattaforma.
          </p>
        </div>
      </div>

      <SectionCard
        title="Richieste in corso"
        description="Monitoraggio delle spedizioni aperte e dei contatti condivisi."
        actions={<span className="text-sm font-semibold text-slate-800">{activeRequests} attive</span>}
        className="xl:col-span-3"
      >
        {companyRequests.length === 0 ? (
          <p className="text-sm leading-relaxed text-slate-600">
            Pubblica la prima richiesta per ingaggiare trasportatori verificati.
          </p>
        ) : (
          <div className="table-shell overflow-x-auto">
            <table className="min-w-[980px]">
              <thead>
                <tr>
                  <th>Titolo</th>
                  <th>Percorso</th>
                  <th>Carico</th>
                  <th>Budget</th>
                  <th>Contatto</th>
                  <th>Pubblicata</th>
                </tr>
              </thead>
              <tbody>
                {companyRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="font-semibold text-slate-900">{request.title}</td>
                    <td className="text-slate-800">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="text-slate-800">{request.cargo ?? "—"}</td>
                    <td className="text-slate-800">{request.budget ?? "—"}</td>
                    <td className="space-y-1 text-slate-800">
                      <div className="font-medium text-slate-900">{request.contactName}</div>
                      <div className="text-xs text-slate-600">{request.contactEmail}</div>
                      <div className="text-xs text-slate-600">{request.contactPhone}</div>
                    </td>
                    <td className="text-slate-800">
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
        description="Inserisci i dettagli principali: percorso, finestra temporale, carico e contatti."
        id="pubblica"
        className="xl:col-span-3"
      >
        <RequestForm publishHref={publishHref} publishCtaLabel={publishCtaLabel} />
      </SectionCard>
    </section>
  );
}
