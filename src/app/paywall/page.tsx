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
    <div className="mx-auto max-w-3xl space-y-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Abbonamento obbligatorio</p>
        <h1 className="text-3xl font-bold text-slate-900">Attiva il tuo accesso a DodiX</h1>
        <p className="text-slate-700">
          Per pubblicare o rispondere alle richieste di trasporto è necessario un abbonamento attivo. La sottoscrizione è
          unica e valida sia per trasportatori che aziende.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-semibold text-slate-900">Cosa include</h2>
          <ul className="mt-4 space-y-3 text-slate-700">
            <li>✔️ Pubblicazione richieste di trasporto illimitate</li>
            <li>✔️ Accesso ai contatti delle aziende o trasportatori</li>
            <li>✔️ Aggiornamenti futuri e assistenza prioritaria</li>
          </ul>
        </div>

        <div className="rounded-md border border-indigo-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Piano unico</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600">Abbonamento mensile</p>
          <p className="text-sm text-slate-600">Annulla in qualsiasi momento dalla tua area cliente Stripe.</p>

          <div className="mt-6">
            <PaywallActions />
          </div>
        </div>
      </div>
    </div>
  );
}
