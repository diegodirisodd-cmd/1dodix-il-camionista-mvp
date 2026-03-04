"use client";

import { useMemo } from "react";

import { calculateCommission, formatCurrency } from "@/lib/commission";
import { type Role } from "@/lib/roles";
export function PaywallModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  priceCents,
  role = "COMPANY",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  priceCents?: number | null;
  role?: Role;
}) {
  const roleHeadline = useMemo(
    () =>
      role === "TRANSPORTER"
        ? "Contatti diretti con aziende verificate, solo quando necessario."
        : "Contatti diretti con trasportatori verificati, solo quando necessario.",
    [role],
  );

  const roleMicrocopy = useMemo(
    () =>
      role === "TRANSPORTER"
        ? "Per garantire contatti qualificati e ridurre perdite di tempo, lo sblocco dei contatti prevede una commissione del 2% + IVA calcolata sul valore del trasporto."
        : "Per garantire contatti qualificati e ridurre perdite di tempo, lo sblocco dei contatti prevede una commissione del 2% + IVA calcolata sul valore del trasporto.",
    [role],
  );

  const normalizedPriceCents = useMemo(() => {
    if (priceCents === null || priceCents === undefined) return null;
    return Number.isFinite(priceCents) ? priceCents : null;
  }, [priceCents]);

  const breakdown = normalizedPriceCents !== null ? calculateCommission(normalizedPriceCents) : null;

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
          <span aria-hidden="true" className="text-lg leading-none">
            ✕
          </span>
        </button>

        <div className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">Sblocco contatti</p>
            <h2 className="text-2xl font-semibold text-[#0f172a]">Sblocca i contatti di questa richiesta</h2>
            <p className="text-sm font-semibold text-[#0f172a]">{roleHeadline}</p>
            <p className="text-sm text-[#475569]">{roleMicrocopy}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <p className="text-sm font-semibold text-[#0f172a]">Informazioni principali</p>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Nessun abbonamento</li>
              <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Paghi solo quando lavori</li>
              <li className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Commissione una tantum per questa richiesta</li>
            </ul>
          </div>

          <div className="space-y-2 rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-sm font-semibold text-[#0f172a]">Riepilogo commissione</p>
            <div className="space-y-2 text-sm text-[#475569]">
              <div className="flex items-center justify-between">
                <span>Valore trasporto</span>
                <span className="font-semibold text-[#0f172a]">
                  {normalizedPriceCents !== null ? formatCurrency(normalizedPriceCents) : "Importo non specificato"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Commissione 2%</span>
                <span className="font-semibold text-[#0f172a]">
                  {breakdown ? formatCurrency(breakdown.commission) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>IVA (22%)</span>
                <span className="font-semibold text-[#0f172a]">
                  {breakdown ? formatCurrency(breakdown.vat) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-2">
                <span className="font-semibold text-[#0f172a]">Totale commissione</span>
                <span className="font-semibold text-[#0f172a]">
                  {breakdown ? formatCurrency(breakdown.total) : "—"}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#64748b]">
              Questa commissione viene applicata una sola volta solo per questa richiesta.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full rounded-full bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sblocco in corso..." : "Conferma e sblocca contatti"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-[#e2e8f0] px-4 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-[#f8fafc]"
            >
              Annulla
            </button>
            <p className="text-xs font-medium text-[#64748b]">
              {breakdown
                ? `Totale commissione: ${formatCurrency(breakdown.total)} (2% + IVA)`
                : "La commissione verrà calcolata sull’importo concordato."}
            </p>
            {normalizedPriceCents !== null && (
              <p className="text-[11px] text-[#64748b]">
                La commissione è calcolata sull’importo indicato nella richiesta.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
