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
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-brand-900/30 backdrop-blur">
        <div className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">Accesso riservato</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Sblocca Dodix Pro</h1>
          <p className="text-neutral-100/80">
            Attiva l’abbonamento per usare la piattaforma con piena operatività e contatti garantiti.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-brand-900/40 p-6 text-left shadow-inner shadow-brand-900/20">
            <h2 className="text-lg font-semibold text-white">Cosa ottieni</h2>
            <ul className="mt-3 space-y-2 text-neutral-100/80">
              <li>• Pubblica incarichi o rispondi alle richieste</li>
              <li>• Contatti diretti con interlocutori verificati</li>
              <li>• Maggiore visibilità per rotte e disponibilità</li>
              <li>• Accesso prioritario alle opportunità strategiche</li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-200">Piano unico</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Accesso completo</h3>
            <p className="text-neutral-100/80">Un solo abbonamento per aziende e trasportatori.</p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-4xl font-bold text-accent-200">€99/mese</p>
              <p className="text-xs text-neutral-200/70">Pagamento sicuro con Stripe Checkout</p>
            </div>
            <div className="mt-5">
              <PaywallActions />
            </div>
            <p className="mt-3 text-xs text-neutral-300/80">Abbonamento mensile. Disdici in qualsiasi momento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
