"use client";

import { X } from "lucide-react";
import { useMemo } from "react";

import { type Role } from "@/lib/roles";
import { CheckoutButton } from "./checkout-button";

export function PaywallModal({
  open,
  onClose,
  role = "COMPANY",
}: {
  open: boolean;
  onClose: () => void;
  role?: Role;
}) {
  const roleHeadline = useMemo(
    () =>
      role === "TRANSPORTER"
        ? "Accedi a richieste reali e contatti diretti"
        : "Pubblica richieste e ricevi trasportatori verificati",
    [role],
  );

  const roleMicrocopy = useMemo(
    () =>
      role === "TRANSPORTER"
        ? "Niente aste, niente intermediari, solo lavoro vero."
        : "Paghi solo per entrare, non per ogni spedizione.",
    [role],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          aria-label="Chiudi paywall"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">Sblocca DodiX Professional</p>
            <h2 className="text-2xl font-semibold text-[#0f172a]">Accedi ai contatti verificati e lavora senza intermediari</h2>
            <p className="text-sm font-semibold text-[#0f172a]">{roleHeadline}</p>
            <p className="text-sm text-[#475569]">{roleMicrocopy}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <h3 className="text-lg font-semibold text-[#0f172a]">Cosa include il piano professionale</h3>
            <ul className="space-y-1 text-sm leading-relaxed text-[#475569]">
              <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Contatti diretti con aziende reali</li>
              <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Nessuna commissione sulle tratte</li>
              <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Opportunità di lavoro aggiornate</li>
              <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Profilo professionale verificato</li>
            </ul>
            <div className="rounded-lg border border-[#F5C76A] bg-white p-3 text-sm text-[#0f172a]">
              <p className="font-semibold">360€ / anno</p>
              <p className="text-[#475569]">Solo 1€ al giorno per lavorare meglio</p>
            </div>
          </div>

          <div className="space-y-2">
            <CheckoutButton role={role} />
            <button
              type="button"
              onClick={onClose}
              className="w-full text-sm font-semibold text-[#0f172a] underline-offset-4 hover:underline"
            >
              Continua a esplorare
            </button>
            <p className="text-xs font-medium text-[#64748b]">Pagamenti sicuri con Stripe • Disdici quando vuoi • Accesso immediato</p>
          </div>
        </div>
      </div>
    </div>
  );
}
