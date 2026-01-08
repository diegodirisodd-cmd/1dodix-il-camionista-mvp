"use client";

import { X } from "lucide-react";
import { useMemo } from "react";

import { type Role } from "@/lib/roles";
export function PaywallModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  budget,
  role = "COMPANY",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  budget?: string | null;
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

  const parsedAmount = useMemo(() => {
    if (!budget) return null;
    const normalized = budget.replace(/[^\d,.-]/g, "");
    if (!normalized) return null;
    const withDecimal = normalized.includes(",")
      ? normalized.replace(/\./g, "").replace(",", ".")
      : normalized;
    const value = Number.parseFloat(withDecimal);
    return Number.isFinite(value) ? value : null;
  }, [budget]);

  const commission = parsedAmount ? parsedAmount * 0.02 : null;
  const vat = commission ? commission * 0.22 : null;
  const total = commission && vat ? commission + vat : null;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);

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
                  {parsedAmount ? formatCurrency(parsedAmount) : "Importo non specificato"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Commissione 2%</span>
                <span className="font-semibold text-[#0f172a]">
                  {commission ? formatCurrency(commission) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>IVA (22%)</span>
                <span className="font-semibold text-[#0f172a]">
                  {vat ? formatCurrency(vat) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-2">
                <span className="font-semibold text-[#0f172a]">Totale commissione</span>
                <span className="font-semibold text-[#0f172a]">
                  {total ? formatCurrency(total) : "—"}
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
              {total
                ? `Totale commissione: ${formatCurrency(total)} (2% + IVA)`
                : "La commissione verrà calcolata sull’importo concordato."}
            </p>
            {parsedAmount && (
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
