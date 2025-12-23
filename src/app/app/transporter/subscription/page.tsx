import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export default async function TransporterSubscriptionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a]">Sblocca i contatti aziendali</h1>
          <p className="text-sm leading-relaxed text-[#475569]">
            Attiva l’abbonamento per vedere email e telefono delle aziende e contattarle senza intermediari.
          </p>
        </div>
        <SubscriptionBadge active={user.subscriptionActive} />
      </div>

      <div className="card space-y-3 text-sm text-[#475569]">
        <p className="text-base font-semibold text-[#0f172a]">Abbonamento annuale</p>
        <p className="leading-relaxed">Accesso completo a contatti, richieste illimitate e visibilità prioritaria.</p>
        <Link
          href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex w-full justify-center sm:w-auto"
        >
          Attiva accesso completo
        </Link>
        <p className="text-xs text-[#64748b]">Senza abbonamento i contatti restano nascosti.</p>
      </div>
    </section>
  );
}
