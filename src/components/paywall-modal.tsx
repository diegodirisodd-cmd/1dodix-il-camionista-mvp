"use client";

import { X } from "lucide-react";
import { useMemo } from "react";

import { type Role } from "@/lib/roles";
export function PaywallModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  role = "COMPANY",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  role?: Role;
}) {
  const roleHeadline = useMemo(
    () =>
      role === "TRANSPORTER"
        ? "Con l’accesso completo puoi contattare subito le aziende e rispondere alle richieste reali."
        : "Con l’accesso completo pubblichi richieste illimitate e ricevi risposte prioritarie.",
    [role],
  );

  const roleMicrocopy = useMemo(
    () =>
      role === "TRANSPORTER"
        ? "Stai per sbloccare i contatti per questa richiesta. In produzione verrà applicata una commissione del 2%."
        : "Stai per sbloccare i contatti per questa richiesta. In produzione verrà applicata una commissione del 2%.",
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">Sblocca i contatti per questa richiesta</p>
            <h2 className="text-2xl font-semibold text-[#0f172a]">Paghi solo quando serve. Nessun piano ricorrente.</h2>
            <p className="text-sm font-semibold text-[#0f172a]">{roleHeadline}</p>
            <p className="text-sm text-[#475569]">{roleMicrocopy}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0f172a] ring-1 ring-[#f5c76a]">
              Commissione 2% – una tantum
            </div>
            <p className="text-sm leading-relaxed text-[#475569]">
              Stai per sbloccare i contatti per questa richiesta. In produzione verrà applicata una commissione del 2%.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-[#f5c76a] to-[#f29f58] px-4 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sblocco in corso..." : "Conferma e sblocca (demo)"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-sm font-semibold text-[#0f172a] underline-offset-4 hover:underline"
            >
              Continua a esplorare
            </button>
            <p className="text-xs font-medium text-[#64748b]">Paghi solo quando serve. Nessun piano ricorrente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
