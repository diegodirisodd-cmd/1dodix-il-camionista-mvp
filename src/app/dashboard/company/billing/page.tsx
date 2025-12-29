import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function CompanyBillingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const subscriptionActive = hasActiveSubscription(user);

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Piano di accesso</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Gestisci il piano professionale</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Sblocca i contatti dei trasportatori e pubblica richieste senza limiti con l’accesso operativo completo.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" role={user.role} />
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm leading-relaxed text-[#475569]">
          Il piano professionale attivo garantisce contatti diretti con trasportatori verificati. Se non attivo, sbloccalo ora per gestire le spedizioni senza intermediari.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Sblocca operatività
          </Link>
          <div className="space-y-1 text-xs font-medium text-[#475569]">
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Contatti diretti verificati</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Nessuna intermediazione</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Priorità nelle richieste</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Disdici quando vuoi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
