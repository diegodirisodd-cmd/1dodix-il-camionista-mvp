import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { PaywallActions } from "@/components/paywall-actions";

export default async function PaywallPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.subscriptionActive) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">Abbonamento obbligatorio</p>
        <h1>Attiva il tuo accesso a DodiX</h1>
        <p>
          Per pubblicare o rispondere alle richieste di trasporto è necessario un abbonamento attivo. La sottoscrizione è
          unica e valida sia per trasportatori che aziende.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-muted space-y-4">
          <div className="flex items-center gap-3">
            <span className="badge-verified">VERIFIED</span>
            <h2 className="text-xl font-semibold text-brand-900">Cosa include</h2>
          </div>
          <ul className="space-y-3 text-neutral-800">
            <li>✔️ Pubblicazione richieste di trasporto illimitate</li>
            <li>✔️ Accesso ai contatti delle aziende o trasportatori</li>
            <li>✔️ Aggiornamenti futuri e assistenza prioritaria</li>
          </ul>
        </div>

        <div className="card space-y-3 border-brand-100">
          <h2 className="text-xl font-semibold text-brand-900">Piano unico</h2>
          <p className="text-3xl font-bold text-brand-800">Abbonamento mensile</p>
          <p className="text-sm text-neutral-700">Annulla in qualsiasi momento dalla tua area cliente Stripe.</p>

          <div className="mt-4">
            <PaywallActions />
          </div>
        </div>
      </div>
    </div>
  );
}
