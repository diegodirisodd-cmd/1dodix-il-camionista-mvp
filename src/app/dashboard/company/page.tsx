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
  const publishCtaLabel = isSubscribed ? "Pubblica nuova richiesta" : "Sblocca l’accesso completo";

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
              Sblocca l’accesso completo
            </Link>
          </div>
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Panoramica azienda</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Gestisci le tue spedizioni in modo diretto</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Pubblica richieste di trasporto e ricevi contatti da trasportatori verificati, senza intermediari.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f172a]">Profilo</p>
          <h2 className="text-xl font-semibold text-[#0f172a]">Identità aziendale</h2>
          <div className="space-y-2 text-sm leading-relaxed text-[#475569]">
            <p>Email: {user.email}</p>
            <p>Ruolo: {user.role}</p>
            <p>Iscritto dal: {new Date(user.createdAt).toLocaleDateString("it-IT")}</p>
          </div>
          <p className="text-xs text-[#64748b]">Mantieni queste informazioni aggiornate per accelerare i contatti diretti.</p>
        </div>

        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f172a]">Richieste</p>
          <h2 className="text-xl font-semibold text-[#0f172a]">Incarichi attivi</h2>
          <p className="text-4xl font-semibold text-[#0f172a]">{activeRequests}</p>
          <p className="text-sm text-[#475569]">Ultima pubblicazione: {lastPublication}</p>
          <p className="text-xs text-[#64748b]">Controlla spesso per mantenere il flusso di spedizioni aperte.</p>
        </div>

        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f172a]">Network</p>
          <h2 className="text-xl font-semibold text-[#0f172a]">Trasportatori verificati</h2>
          <p className="text-4xl font-semibold text-[#0f172a]">{verifiedTransporters}</p>
          <p className="text-sm text-[#475569] leading-relaxed">
            Carichi visibili a una rete di professionisti attivi sulla piattaforma.
          </p>
          <p className="text-xs text-[#64748b]">Nessun intermediario. Contatto diretto.</p>
        </div>
      </div>

      <SectionCard
        title="Richieste disponibili ora"
        description="Le richieste sono visibili solo a trasportatori registrati."
        actions={<span className="text-sm font-semibold text-slate-800">{activeRequests} attive</span>}
        className="xl:col-span-3"
      >
        {companyRequests.length === 0 ? (
          <p className="text-sm leading-relaxed text-[#475569]">
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
                    <td className="font-semibold text-[#0f172a]">{request.title}</td>
                    <td className="text-[#475569]">
                      {request.pickup} → {request.dropoff}
                    </td>
                    <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                    <td className="text-[#475569]">{request.budget ?? "—"}</td>
                    <td className="space-y-1 text-[#475569]">
                      <div className="font-medium text-[#0f172a]">{request.contactName}</div>
                      <div className="text-xs text-[#64748b]">{request.contactEmail}</div>
                      <div className="text-xs text-[#64748b]">{request.contactPhone}</div>
                    </td>
                    <td className="text-[#475569]">
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
        title="Pubblica nuova richiesta"
        description="Inserisci i dettagli per ricevere contatti da trasportatori compatibili. La richiesta sarà visibile solo a trasportatori registrati."
        id="pubblica"
        className="xl:col-span-3"
      >
        <RequestForm publishHref={publishHref} publishCtaLabel={publishCtaLabel} />
        <p className="text-xs text-[#64748b]">Nessun intermediario. Contatto diretto.</p>
      </SectionCard>
    </section>
  );
}
