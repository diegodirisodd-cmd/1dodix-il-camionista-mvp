import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";

export default async function CompanyBillingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Piano di accesso</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Gestisci l&apos;abbonamento aziendale</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Sblocca i contatti dei trasportatori e pubblica richieste senza limiti.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm leading-relaxed text-[#475569]">
          L&apos;abbonamento attivo garantisce contatti diretti con trasportatori verificati. Se non attivo, attivalo ora per gestire le spedizioni senza intermediari.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Attiva accesso completo
          </Link>
          <p className="text-xs text-[#64748b]">Sblocca contatti diretti, richieste illimitate e priorità di visibilità.</p>
        </div>
      </div>
    </section>
  );
}
