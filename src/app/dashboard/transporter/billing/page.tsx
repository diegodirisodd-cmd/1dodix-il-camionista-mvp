import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function TransporterBillingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  const subscriptionActive = hasActiveSubscription(user);

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-textStrong">Commissione per richiesta</p>
            <h1 className="text-3xl font-semibold text-textStrong">Sblocca i contatti quando serve</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Paghi solo quando decidi di sbloccare i contatti di una richiesta. Nessun canone fisso.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" role={user.role} />
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm leading-relaxed text-slate-600">
          Puoi esplorare tutte le richieste, ma per contattare direttamente un’azienda devi sbloccare i contatti per quella specifica richiesta.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/dashboard/transporter/jobs" className="btn btn-primary">
            Vai alle richieste
          </a>
          <div className="space-y-1 text-xs font-medium text-slate-600">
            <div className="flex items-start gap-2"><span className="text-textStrong">✔</span> Contatti diretti verificati</div>
            <div className="flex items-start gap-2"><span className="text-textStrong">✔</span> Nessuna intermediazione</div>
            <div className="flex items-start gap-2"><span className="text-textStrong">✔</span> Priorità nelle richieste</div>
            <div className="flex items-start gap-2"><span className="text-textStrong">✔</span> Paghi solo quando sblocchi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
