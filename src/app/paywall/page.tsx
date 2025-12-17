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
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Accesso solo su abbonamento</p>
        <h1>Abbonamento obbligatorio per operare su DodiX</h1>
        <p className="text-neutral-100/80">
          Aziende e trasportatori lavorano solo con un abbonamento attivo. Questo mantiene il network verificato, tutela i
          contatti e riduce i tempi di risposta.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="card-muted space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl text-white">Perché l&apos;abbonamento è obbligatorio</h2>
            <p className="text-neutral-100/80">
              L&apos;abbonamento protegge la qualità del marketplace: accessi verificati, contatti visibili solo a profili
              attivi e tempi di risposta misurabili tra aziende e trasportatori.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card space-y-3">
              <h3 className="text-lg font-semibold text-white">Cosa è incluso</h3>
              <ul className="space-y-2 text-neutral-100/80">
                <li>✔️ Pubblica e gestisci richieste senza limiti</li>
                <li>✔️ Contatti diretti con partner verificati</li>
                <li>✔️ Visibilità prioritaria per profili affidabili</li>
                <li>✔️ Supporto B2B e tracciabilità delle attività</li>
              </ul>
            </div>

            <div className="card space-y-3">
              <h3 className="text-lg font-semibold text-white">Vale per ogni ruolo</h3>
              <p className="text-neutral-100/80">
                Nessuna eccezione: aziende e trasportatori devono essere abbonati. È il modo più semplice per garantire
                interlocutori affidabili, contatti protetti e SLA rispettati.
              </p>
            </div>
          </div>

          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <span className="badge-verified">VERIFIED</span>
              <h3 className="text-lg font-semibold text-white">Valore per ruolo</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-200">Aziende</p>
                <ul className="space-y-2 text-neutral-100/80">
                  <li>• Rete di trasportatori verificati e pronti</li>
                  <li>• Contatti visibili solo a profili abbonati</li>
                  <li>• SLA di risposta tracciati e riduzione dei tempi</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-200">Trasportatori</p>
                <ul className="space-y-2 text-neutral-100/80">
                  <li>• Carichi qualificati con briefing completi</li>
                  <li>• Badge di affidabilità e verifica documentale</li>
                  <li>• Priorità verso aziende con processi strutturati</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-5 border border-white/10 bg-brand-900/40 shadow-lg shadow-brand-900/20">
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-300">Piano unico</p>
            <h2 className="text-2xl font-semibold text-white">Abbonamento mensile</h2>
            <p className="text-neutral-100/80">Un solo prezzo per aziende e trasportatori. Nessun costo nascosto.</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-4xl font-extrabold text-accent-200">€99</p>
            <p className="text-sm text-neutral-100/80">al mese, rinnovo automatico, disdici in autonomia da Stripe</p>
          </div>

          <div className="space-y-2 text-sm text-neutral-100/80">
            <p className="font-semibold text-white">Cosa è incluso</p>
            <ul className="space-y-1">
              <li>✔️ Accesso completo al marketplace</li>
              <li>✔️ Supporto clienti con SLA B2B</li>
              <li>✔️ Aggiornamenti continui e sicurezza dei dati</li>
            </ul>
          </div>

          <PaywallActions />

          <p className="text-xs text-neutral-200/80">
            Pagamenti gestiti da Stripe. Senza abbonamento non è possibile accedere a richieste, contatti e dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
