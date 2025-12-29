import Link from "next/link";
import type { ReactNode } from "react";

import { billingDestinationForRole } from "@/lib/subscription";
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
          "Richieste illimitate e prioritarie",
          "Visibilità aumentata sul network",
        ]
      : [
          "Richieste illimitate e prioritarie",
          "Contatti diretti con trasportatori verificati",
          "Gestione centralizzata delle spedizioni",
        ];

  const billingPath = billingDestinationForRole(role);

  return (
    <div className="space-y-4">
      <div className="pointer-events-none blur-[1px] opacity-70">{children}</div>
      <div className="relative overflow-hidden rounded-2xl border border-[#f5c76a] bg-white p-6 shadow-sm">
        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#fff8ed] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#92400e] ring-1 ring-[#f5c76a]">
          <span className="text-[13px]">⚠️</span> Accesso limitato
        </div>
        <div className="space-y-2 pr-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Funzionalità premium</p>
          <h3 className="text-2xl font-semibold text-[#0f172a]">Sblocca l’accesso completo</h3>
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
          <Link
            href={billingPath}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#f5c76a] to-[#f29f58] px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:brightness-95 sm:w-auto"
          >
            Attiva accesso completo
          </Link>
          <Link
            href={billingPath}
            className="text-sm font-semibold text-[#0f172a] underline-offset-4 hover:underline"
          >
            Scopri cosa sblocchi
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#64748b]">
          <span>Pagamenti sicuri con Stripe</span>
          <span>Disdici quando vuoi</span>
          <span>Accesso immediato</span>
        </div>
      </div>
    </div>
  );
}
