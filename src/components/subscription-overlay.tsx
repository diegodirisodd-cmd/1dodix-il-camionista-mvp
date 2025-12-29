import Link from "next/link";
import type { ReactNode } from "react";

export function SubscriptionOverlay({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  if (!show) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-60">{children}</div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="max-w-lg space-y-4 rounded-xl border border-amber-200 bg-white/95 p-6 text-center shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Funzionalità premium</p>
            <h3 className="text-xl font-semibold text-[#0f172a]">Sblocca l’accesso completo</h3>
            <p className="text-sm leading-relaxed text-[#475569]">
              Per contattare direttamente aziende e trasportatori e inviare richieste illimitate è necessario un abbonamento attivo.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/billing"
              className="btn-primary w-full justify-center sm:w-auto"
            >
              Attiva accesso completo
            </Link>
            <Link
              href="/dashboard/billing"
              className="text-sm font-semibold text-[#0f172a] underline-offset-4 hover:underline"
            >
              Scopri cosa include
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-[11px] font-medium text-[#64748b]">
            <span>Pagamenti sicuri con Stripe</span>
            <span>Disdici quando vuoi</span>
            <span>Accesso immediato</span>
          </div>
        </div>
      </div>
    </div>
  );
}
