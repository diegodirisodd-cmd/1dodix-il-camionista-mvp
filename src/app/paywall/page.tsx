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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">Piano professionale</p>
          <h1 className="text-3xl font-semibold text-[#0f172a] md:text-4xl">Sblocca l’accesso operativo completo</h1>
          <p className="text-sm leading-relaxed text-[#475569]">
            Attiva il piano professionale per contattare direttamente aziende e trasportatori verificati. Nessuna intermediazione, solo operatività.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Cosa ottieni</p>
            <ul className="space-y-2 text-sm leading-relaxed text-[#475569]">
              <li>✔ Contatti diretti verificati</li>
              <li>✔ Nessuna intermediazione</li>
              <li>✔ Priorità nelle richieste</li>
              <li>✔ Disdici quando vuoi</li>
            </ul>
            <p className="text-xs text-[#64748b]">Puoi esplorare la piattaforma, ma per lavorare davvero serve l’accesso operativo completo.</p>
          </div>

          <div className="space-y-4 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Piano professionale</p>
            <h3 className="text-2xl font-semibold text-[#0f172a]">Accesso operativo</h3>
            <p className="text-sm leading-relaxed text-[#475569]">
              Un unico piano per aziende e trasportatori che vogliono lavorare senza limiti. Il pricing è visibile nella pagina di fatturazione.
            </p>
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
