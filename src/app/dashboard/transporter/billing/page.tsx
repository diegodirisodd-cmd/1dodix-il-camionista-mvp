import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";

export default async function TransporterBillingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Piano di accesso</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Sblocca i contatti delle aziende</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Con l&apos;abbonamento attivo visualizzi subito i referenti e rispondi alle richieste reali.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm leading-relaxed text-[#475569]">
          Se l&apos;abbonamento non è attivo puoi vedere solo i dettagli generali delle richieste. Attivalo per contattare direttamente le aziende.
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
