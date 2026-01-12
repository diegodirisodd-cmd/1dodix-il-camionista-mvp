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
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Commissione per richiesta</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Sblocca i contatti quando serve</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Paghi solo quando sblocchi i contatti di una richiesta. Nessun canone fisso.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" role={user.role} />
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm leading-relaxed text-[#475569]">
          Pubblica richieste e sblocca i contatti solo quando vuoi parlare con un trasportatore. Paghi una commissione una tantum per richiesta.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/dashboard/company/requests" className="btn btn-primary">
            Vai alle richieste
          </a>
          <div className="space-y-1 text-xs font-medium text-[#475569]">
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Contatti diretti verificati</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Nessuna intermediazione</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Priorità nelle richieste</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Paghi solo quando sblocchi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
