import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { billingPathForRole, hasActiveSubscription } from "@/lib/subscription";

export default async function TransporterSubscriptionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const subscriptionActive = hasActiveSubscription(user);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a]">Sblocca i contatti aziendali</h1>
          <p className="text-sm leading-relaxed text-[#475569]">
            Attiva il piano professionale per vedere email e telefono delle aziende e contattarle senza intermediari.
          </p>
        </div>
        <SubscriptionBadge active={subscriptionActive} role={user.role} />
      </div>

      <div className="card space-y-4 text-sm text-[#475569]">
        <p className="text-base font-semibold text-[#0f172a]">Piano professionale</p>
        <p className="leading-relaxed">Accesso operativo completo a contatti, richieste illimitate e visibilità prioritaria.</p>
        <Link
          href={billingPathForRole(user.role)}
          className="btn-primary inline-flex w-full justify-center sm:w-auto"
        >
          Sblocca operatività
        </Link>
        <div className="space-y-1 text-sm font-medium text-[#475569]">
          <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Contatti diretti verificati</div>
          <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Nessuna intermediazione</div>
          <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Priorità nelle richieste</div>
          <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Disdici quando vuoi</div>
        </div>
        <p className="text-xs text-[#64748b]">Senza accesso operativo completo i contatti restano nascosti.</p>
      </div>
    </section>
  );
}
