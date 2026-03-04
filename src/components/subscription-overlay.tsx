"use client";

import type { ReactNode } from "react";

import { type Role } from "@/lib/roles";
export function SubscriptionOverlay({
  show,
  children,
  role = "COMPANY",
}: {
  show: boolean;
  children: ReactNode;
  role?: Role;
}) {
  if (!show) return <>{children}</>;

  const description =
    role === "TRANSPORTER"
      ? "Con l’accesso completo puoi contattare subito le aziende e rispondere alle richieste reali."
      : "Con l’accesso completo pubblichi richieste illimitate e ricevi risposte prioritarie.";

  const bullets =
    role === "TRANSPORTER"
      ? [
          "Contatti diretti senza intermediari",
          "Nessun canone fisso",
          "Commissione solo quando sblocchi",
        ]
      : [
          "Richieste illimitate e prioritarie",
          "Contatti diretti con trasportatori verificati",
          "Commissione solo quando sblocchi",
        ];

  return (
    <div className="space-y-4">
      <div className="pointer-events-none blur-[1px] opacity-70">{children}</div>
      <div className="relative overflow-hidden rounded-2xl border border-[#f5c76a] bg-white p-6 shadow-sm">
        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#334155] ring-1 ring-[#f5c76a]">
          <span className="text-[13px]">⚠️</span> Commissione 2% – una tantum
        </div>
        <div className="space-y-2 pr-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Sblocco contatti</p>
          <h3 className="text-2xl font-semibold text-[#0f172a]">Sblocca i contatti per questa richiesta</h3>
          <p className="text-sm leading-relaxed text-[#475569]">{description}</p>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[#475569]">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-[#f5a524]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            className="w-full rounded-full bg-gradient-to-r from-[#f5c76a] to-[#f29f58] px-4 py-2 text-xs font-semibold text-[#0f172a] shadow-sm transition hover:brightness-95 sm:w-auto"
          >
            Sblocca contatti (commissione 2%)
          </button>
          <button
            type="button"
            className="w-full rounded-full border border-[#0f172a]/20 px-4 py-2 text-xs font-semibold text-[#0f172a] sm:w-auto"
          >
            Scopri cosa sblocchi
          </button>
        </div>
        <div className="mt-3 space-y-1 text-[12px] font-semibold text-[#0f172a]">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#0f172a]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f8fafc] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#334155] ring-1 ring-[#f5c76a]">Commissione 2% – una tantum</span>
            <span className="text-[11px] font-medium text-[#475569]">Paghi solo quando sblocchi i contatti, senza vincoli ricorrenti.</span>
          </div>
          <div className="mt-2 space-y-1 text-sm font-medium text-[#475569]">
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Contatti diretti verificati</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Nessuna intermediazione</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Priorità nelle richieste</div>
            <div className="flex items-start gap-2"><span className="text-[#0f172a]">✔</span> Disdici quando vuoi</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#64748b]">
            <span>Commissione applicata solo allo sblocco</span>
            <span>Nessun canone fisso</span>
          </div>
        </div>
      </div>
    </div>
  );
}
