import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function TransporterSubscriptionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser(user.role));
  }

  const subscriptionActive = hasActiveSubscription(user);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a]">Sblocca i contatti per richiesta</h1>
          <p className="text-sm leading-relaxed text-[#475569]">
            Paghi solo quando serve. La commissione si applica quando sblocchi i contatti di una richiesta.
          </p>
        </div>
        <SubscriptionBadge active={subscriptionActive} role={user.role} />
      </div>

      <div className="card space-y-4 text-sm text-[#475569]">
        <p className="text-base font-semibold text-[#0f172a]">Commissione 2% – una tantum</p>
        <p className="leading-relaxed">Sblocca i contatti aziendali solo quando vuoi rispondere a una richiesta.</p>
        <Link
          href="/app/transporter/requests"
          className="btn-primary inline-flex w-full justify-center sm:w-auto"
        >
          Sblocca contatti (commissione 2%)
        </Link>
        <div className="space-y-1 text-sm font-medium text-[#475569]">
          <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Contatti diretti verificati</div>
          <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Nessuna intermediazione</div>
          <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Priorità nelle richieste</div>
          <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Paghi solo quando sblocchi</div>
        </div>
        <p className="text-xs text-[#64748b]">Senza sblocco i contatti restano oscurati.</p>
      </div>
    </section>
  );
}
