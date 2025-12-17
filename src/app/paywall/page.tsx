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
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">Accesso solo su abbonamento</p>
        <h1>Operatività garantita con il piano DodiX</h1>
        <p className="text-neutral-700">
          Ogni azienda e trasportatore deve avere un abbonamento attivo per pubblicare, rispondere e contattare. È una
          scelta di business: qualità delle richieste, identità verificata e supporto continuo.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="card-muted space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-brand-900">Perché l&apos;abbonamento è obbligatorio</h2>
            <p className="text-neutral-700">
              Manteniamo il marketplace pulito e affidabile. L&apos;abbonamento filtra gli accessi opportunistici, tutela i
              dati di contatto e garantisce risposte rapide tra aziende e trasportatori.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card space-y-3 border-brand-100 bg-white/70">
              <h3 className="text-lg font-semibold text-brand-900">Cosa ottieni</h3>
              <ul className="space-y-2 text-neutral-800">
                <li>✔️ Pubblica richieste senza limiti</li>
                <li>✔️ Contatta direttamente partner verificati</li>
                <li>✔️ Visibilità prioritaria nelle ricerche</li>
                <li>✔️ Supporto dedicato e roadmap B2B</li>
              </ul>
            </div>

            <div className="card space-y-3 border-brand-100 bg-white/70">
              <h3 className="text-lg font-semibold text-brand-900">Applicato a tutti</h3>
              <p className="text-neutral-700">
                Nessuna eccezione: aziende e trasportatori devono essere abbonati. È il modo più semplice per garantire
                serietà, tempi di risposta brevi e un flusso costante di richieste qualificate.
              </p>
            </div>
          </div>

          <div className="card space-y-4 border-brand-100 bg-white/70">
            <div className="flex items-center gap-2">
              <span className="badge-verified">VERIFIED</span>
              <h3 className="text-lg font-semibold text-brand-900">Value per ruoli</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Aziende</p>
                <ul className="space-y-2 text-neutral-800">
                  <li>• Rete di trasportatori affidabili</li>
                  <li>• Contatti visibili solo a profili verificati</li>
                  <li>• SLA di risposta chiari grazie all&apos;accesso a pagamento</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Trasportatori</p>
                <ul className="space-y-2 text-neutral-800">
                  <li>• Carichi disponibili con contatti completi</li>
                  <li>• Badge di affidabilità incluso</li>
                  <li>• Maggiore visibilità verso aziende premium</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-5 border-brand-100 bg-white/80 shadow-lg shadow-brand-900/5">
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">Piano unico</p>
            <h2 className="text-2xl font-semibold text-brand-900">Abbonamento mensile</h2>
            <p className="text-neutral-700">Un solo prezzo per aziende e trasportatori. Nessun costo nascosto.</p>
          </div>

          <div className="rounded-lg bg-brand-50 p-5 text-center">
            <p className="text-4xl font-extrabold text-brand-800">€99</p>
            <p className="text-sm text-neutral-700">al mese, rinnovo automatico, disdici in autonomia da Stripe</p>
          </div>

          <div className="space-y-2 text-sm text-neutral-700">
            <p className="font-semibold text-brand-900">Cosa è incluso</p>
            <ul className="space-y-1">
              <li>✔️ Accesso completo al marketplace</li>
              <li>✔️ Supporto clienti con SLA B2B</li>
              <li>✔️ Aggiornamenti continui e sicurezza dei dati</li>
            </ul>
          </div>

          <PaywallActions />

          <p className="text-xs text-neutral-500">
            Pagamenti gestiti da Stripe. Nessuna eccezione: senza abbonamento non hai accesso operativo.
          </p>
        </div>
      </div>
    </div>
  );
}
