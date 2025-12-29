import { redirect } from "next/navigation";

import { PaywallActions } from "@/components/paywall-actions";
import { getSessionUser } from "@/lib/auth";

export default async function PaywallPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.subscriptionActive) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f5f7fa] px-4 py-16">
      <div className="w-full max-w-4xl space-y-8 rounded-2xl border border-[#e5e7eb] bg-white p-10 shadow-lg">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">Accesso riservato</p>
          <h1 className="text-3xl font-semibold text-[#0f172a] md:text-4xl">Sblocca l’accesso completo</h1>
          <p className="text-sm leading-relaxed text-[#475569]">
            Con l’abbonamento annuale accedi ai contatti diretti e lavori senza limiti. Nessun intermediario, solo aziende e trasportatori verificati.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Cosa include</p>
            <ul className="space-y-2 text-sm leading-relaxed text-[#475569]">
              <li>• Pubblica richieste di trasporto senza limiti</li>
              <li>• Contatti diretti con interlocutori verificati</li>
              <li>• Visibilità prioritaria sulle tratte operative</li>
              <li>• Supporto dedicato per aziende e trasportatori</li>
            </ul>
            <p className="text-xs text-[#64748b]">Le richieste sono visibili solo a utenti registrati.</p>
          </div>

          <div className="space-y-4 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Piano unico</p>
            <h3 className="text-2xl font-semibold text-[#0f172a]">Accesso annuale</h3>
            <p className="text-sm leading-relaxed text-[#475569]">Un solo piano per aziende e trasportatori, con contatti sbloccati.</p>
            <div className="rounded-lg border border-[#e5e7eb] bg-slate-50 p-5 text-center">
              <p className="text-4xl font-bold text-[#0f172a]">360€ / anno</p>
              <p className="text-xs text-[#64748b]">Pagamento sicuro via Stripe Checkout</p>
            </div>
            <div className="space-y-2">
              <PaywallActions />
              <p className="text-xs text-[#64748b]">Pagamenti sicuri con Stripe · Disdici quando vuoi · Accesso immediato</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
