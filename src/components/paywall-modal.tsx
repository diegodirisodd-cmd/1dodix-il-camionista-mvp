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
          className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
          aria-label="Chiudi paywall"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ✕
          </span>
        </button>

        <div className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Sblocco contatti</p>
            <h2 className="text-2xl font-semibold text-textStrong">Sblocca i contatti di questa richiesta</h2>
            <p className="text-sm font-semibold text-textStrong">{roleHeadline}</p>
            <p className="text-sm text-neutral-600">{roleMicrocopy}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-semibold text-textStrong">Informazioni principali</p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2"><span className="text-textStrong">✔</span> Nessun abbonamento</li>
              <li className="flex items-start gap-2"><span className="text-textStrong">✔</span> Paghi solo quando lavori</li>
              <li className="flex items-start gap-2"><span className="text-textStrong">✔</span> Commissione una tantum per questa richiesta</li>
            </ul>
          </div>

          <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-sm font-semibold text-textStrong">Riepilogo commissione</p>
            <div className="space-y-2 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <span>Valore trasporto</span>
                <span className="font-semibold text-textStrong">
                  {normalizedPriceCents !== null ? formatCurrency(normalizedPriceCents) : "Importo non specificato"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Commissione 2%</span>
                <span className="font-semibold text-textStrong">
                  {breakdown ? formatCurrency(breakdown.commission) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>IVA (22%)</span>
                <span className="font-semibold text-textStrong">
                  {breakdown ? formatCurrency(breakdown.vat) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
                <span className="font-semibold text-textStrong">Totale commissione</span>
                <span className="font-semibold text-textStrong">
                  {breakdown ? formatCurrency(breakdown.total) : "—"}
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Questa commissione viene applicata una sola volta solo per questa richiesta.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="btn-primary min-h-[44px] w-full px-4 py-3"
            >
              {loading ? "Sblocco in corso..." : "Conferma e sblocca contatti"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary min-h-[44px] w-full px-4 py-3"
            >
              Annulla
            </button>
            <p className="text-xs font-medium text-neutral-500">
              {breakdown
                ? `Totale commissione: ${formatCurrency(breakdown.total)} (2% + IVA)`
                : "La commissione verrà calcolata sull’importo concordato."}
            </p>
            {normalizedPriceCents !== null && (
              <p className="text-[11px] text-neutral-500">
                La commissione è calcolata sull’importo indicato nella richiesta.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
