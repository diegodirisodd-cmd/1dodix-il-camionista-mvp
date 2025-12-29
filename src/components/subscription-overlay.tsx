import Link from "next/link";
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

  const bullets =
    role === "TRANSPORTER"
      ? [
          "Contatti diretti con i referenti aziendali",
          "Richieste illimitate e prioritarie",
          "Risposte rapide senza intermediari",
        ]
      : [
          "Contatti diretti senza intermediari",
          "Richieste illimitate e prioritarie",
          "Visibilità aumentata sul network",
        ];

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-60">{children}</div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <div className="relative max-w-2xl space-y-4 rounded-2xl border border-[#f5c76a] bg-white p-6 text-left shadow-xl">
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#fff8ed] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#92400e] ring-1 ring-[#f5c76a]">
            <span className="text-[13px]">⚠️</span> Accesso limitato
          </div>
          <div className="space-y-2 pr-24 sm:pr-28">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Funzionalità premium</p>
            <h3 className="text-2xl font-semibold text-[#0f172a]">Sblocca l’accesso completo</h3>
            <p className="text-sm leading-relaxed text-[#475569]">
              Accedi ai contatti reali e lavora solo con aziende verificate.
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[#475569]">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#f5a524]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href="/dashboard/billing"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#f5c76a] to-[#f29f58] px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:brightness-95 sm:w-auto"
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
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#64748b]">
            <span>Pagamenti sicuri con Stripe</span>
            <span>Disdici quando vuoi</span>
            <span>Accesso immediato</span>
          </div>
        </div>
      </div>
    </div>
  );
}
