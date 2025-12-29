import Link from "next/link";
import { redirect } from "next/navigation";

import { RequestForm } from "@/components/dashboard/request-form";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";

export default async function CompanyNewRequestPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const isSubscribed = Boolean(user.subscriptionActive);

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Crea richiesta</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Crea una nuova richiesta di trasporto</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Inserisci tratta, carico e referenti. La richiesta sarà visibile solo ai trasportatori registrati.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" />
        </div>
        <p className="text-xs text-[#64748b]">Nessun intermediario. Contatto diretto.</p>
      </div>

      {isSubscribed ? (
        <div className="card space-y-4">
          <RequestForm onSuccessRedirect="/dashboard/company/requests?created=1" />
          <p className="text-xs text-[#64748b]">Le richieste sono visibili solo a trasportatori registrati.</p>
        </div>
      ) : (
        <div className="card space-y-3 border-amber-200 bg-amber-50/60 text-sm leading-relaxed text-[#0f172a]">
          <p className="font-semibold">Sblocca i contatti verificati prima di pubblicare.</p>
          <p className="text-[#475569]">Attiva l&apos;abbonamento per pubblicare nuove richieste e condividere i tuoi contatti.</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Attiva accesso completo
            </Link>
            <Link href="/dashboard/company" className="btn btn-secondary">
              Torna alla dashboard
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
