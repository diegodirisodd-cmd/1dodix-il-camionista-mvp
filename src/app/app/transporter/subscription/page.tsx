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
            Attiva l’abbonamento per vedere email e telefono delle aziende e contattarle senza intermediari.
          </p>
        </div>
        <SubscriptionBadge active={subscriptionActive} role={user.role} />
      </div>

      <div className="card space-y-3 text-sm text-[#475569]">
        <p className="text-base font-semibold text-[#0f172a]">Abbonamento annuale</p>
        <p className="leading-relaxed">Accesso completo a contatti, richieste illimitate e visibilità prioritaria.</p>
        <Link
          href={billingPathForRole(user.role)}
          className="btn-primary inline-flex w-full justify-center sm:w-auto"
        >
          Attiva accesso completo
        </Link>
        <p className="text-xs text-[#64748b]">Senza abbonamento i contatti restano nascosti.</p>
      </div>
    </section>
  );
}
