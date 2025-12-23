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

  const companyRequests = await prisma.request.findMany({
    where: { companyId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const activeRequests = companyRequests.length;
  const showCreatedBanner = searchParams?.created === "1";
  const publishHref = isSubscribed ? "#pubblica" : "https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01";
  const publishCtaLabel = isSubscribed ? "Pubblica una nuova spedizione" : "Attiva accesso completo";

  return (
    <section className="space-y-6">
      {showCreatedBanner && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
          Richiesta creata correttamente. Puoi gestirla qui nella dashboard.
        </div>
      )}
      <div className="card space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Panoramica operativa</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Trova trasportatori affidabili, senza intermediari</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Pubblica una richiesta e ricevi contatti verificati: la gestione rimane sempre sotto il tuo controllo.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={publishHref}
            className="btn btn-primary"
            target={isSubscribed ? undefined : "_blank"}
            rel={isSubscribed ? undefined : "noopener noreferrer"}
          >
            Pubblica una nuova spedizione
          </Link>
          <p className="text-xs text-[#64748b]">Le richieste sono visibili solo a trasportatori registrati.</p>
        </div>
        {!isSubscribed && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="leading-relaxed text-slate-800">
                Per pubblicare nuove richieste e condividere contatti è necessario attivare l’abbonamento.
              </p>
              <Link
                href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex w-full justify-center px-4 py-2 text-sm font-semibold sm:w-auto"
              >
                Attiva accesso completo
              </Link>
            </div>
            <p className="mt-2 text-xs font-medium text-[#475569]">
              Sblocca contatti diretti, richieste illimitate e priorità di visibilità.
            </p>
          </div>
        )}
      </div>

      <SectionCard
        title="Pubblica una nuova spedizione"
        description="Inserisci i dettagli per ricevere contatti da trasportatori compatibili. La richiesta sarà visibile solo a trasportatori registrati."
        id="pubblica"
        className="xl:col-span-3"
        actions={
          !isSubscribed ? (
            <Link
              href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Attiva accesso completo
            </Link>
          ) : undefined
        }
      >
        {isSubscribed ? (
          <>
            <RequestForm publishHref={publishHref} publishCtaLabel={publishCtaLabel} />
            <p className="text-xs text-[#64748b]">Le richieste sono visibili solo a trasportatori registrati.</p>
          </>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-slate-800">
            Attiva l’abbonamento per pubblicare subito una richiesta e condividere i tuoi contatti con trasportatori verificati.
          </div>
        )}
      </SectionCard>

      <SectionCard
        id="storico"
        title="Storico richieste"
        description="Visualizza tutte le richieste inviate e i contatti ricevuti."
        className="xl:col-span-3"
      >
        {companyRequests.length === 0 ? (
          <p className="text-sm leading-relaxed text-[#475569]">
            Pubblica la prima richiesta per ingaggiare trasportatori verificati.
          </p>
        ) : (
          <div className="table-shell overflow-x-auto">
            <table className="min-w-[1020px]">
              <thead>
                <tr>
                  <th>Titolo</th>
                  <th>Percorso</th>
                  <th>Carico</th>
                  <th>Budget</th>
                  <th>Stato</th>
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
                    <td className="text-[#0f172a]">Attiva</td>
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
    </section>
  );
}
