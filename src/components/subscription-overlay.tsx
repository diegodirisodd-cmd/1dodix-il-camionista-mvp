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
      <div className="relative overflow-hidden rounded-2xl border border-accent-200 bg-white p-6 shadow-sm">
        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700 ring-1 ring-accent-200">
          <span className="text-[13px]">⚠️</span> Commissione 2% – una tantum
        </div>
        <div className="space-y-2 pr-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-textStrong">Sblocco contatti</p>
          <h3 className="text-2xl font-semibold text-textStrong">Sblocca i contatti per questa richiesta</h3>
          <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-neutral-600">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-accent-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            className="btn-primary min-h-[44px] w-full text-xs sm:w-auto"
          >
            Sblocca contatti (commissione 2%)
          </button>
          <button
            type="button"
            className="btn-secondary min-h-[44px] w-full text-xs sm:w-auto"
          >
            Scopri cosa sblocchi
          </button>
        </div>
        <div className="mt-3 space-y-1 text-[12px] font-semibold text-textStrong">
          <div className="flex flex-wrap items-center gap-3 text-xs text-textStrong">
            <span className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-700 ring-1 ring-accent-200">Commissione 2% – una tantum</span>
            <span className="text-[11px] font-medium text-neutral-600">Paghi solo quando sblocchi i contatti, senza vincoli ricorrenti.</span>
          </div>
          <div className="mt-2 space-y-1 text-sm font-medium text-neutral-600">
            <div className="flex items-start gap-2"><span className="text-textStrong">✔</span> Contatti diretti verificati</div>
            <div className="flex items-start gap-2"><span className="text-textStrong">✔</span> Nessuna intermediazione</div>
            <div className="flex items-start gap-2"><span className="text-textStrong">✔</span> Priorità nelle richieste</div>
            <div className="flex items-start gap-2"><span className="text-textStrong">✔</span> Disdici quando vuoi</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-neutral-500">
            <span>Commissione applicata solo allo sblocco</span>
            <span>Nessun canone fisso</span>
          </div>
        </div>
      </div>
    </div>
  );
}
