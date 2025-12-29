import Link from "next/link";
import type { ReactNode } from "react";

import { billingPathForRole } from "@/lib/subscription";
import { type Role } from "@/lib/roles";

function IconCheck() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414l2.793 2.793 6.543-6.543a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconLightning() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 2a1 1 0 01.92.608l5 12A1 1 0 0118 16h-5.382l.964 4.818a1 1 0 01-1.61.96l-10-8a1 1 0 01.64-1.778H9.82L7.63 3.316A1 1 0 018.6 2.08L12 4.44 12.92 2.4A1 1 0 0113 2z" />
    </svg>
  );
}

export function SubscriptionBadge({
  active,
  className = "",
  icon = "check",
  role = "COMPANY",
}: {
  active: boolean;
  className?: string;
  icon?: "check" | "lightning";
  role?: Role;
}) {
  const content: {
    label: string;
    color: string;
    icon: ReactNode;
    cta?: ReactNode;
    helper?: ReactNode;
  } = active
    ? {
        label: "Accesso completo",
        color: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
        icon: icon === "lightning" ? <IconLightning /> : <IconCheck />,
      }
    : {
        label: "Accesso limitato",
        color: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
        icon: <IconLightning />,
        cta: (
          <div className="flex flex-col gap-1 text-left text-[11px] font-semibold text-[#0f172a]">
            <Link
              href={billingPathForRole(role)}
              className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#0f172a] shadow-sm ring-1 ring-amber-200 transition hover:bg-[#fff7ed]"
            >
              Sblocca contatti e richieste
            </Link>
            <div className="flex flex-wrap gap-2 text-[10px] font-medium text-[#64748b]">
              <span>Pagamenti sicuri con Stripe</span>
              <span>Disdici quando vuoi</span>
              <span>Accesso immediato</span>
            </div>
          </div>
        ),
        helper: (
          <span className="text-[11px] font-medium text-[#475569]">
            Stai utilizzando la versione gratuita. Sblocca l’accesso completo alle funzionalità premium.
          </span>
        ),
      };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${content.color} ${className}`.trim()}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-white/60 p-1 text-current">
        {content.icon}
      </span>
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2">{content.label}</span>
        {!active && content.helper}
      </div>
      {!active && content.cta}
    </div>
  );
}
