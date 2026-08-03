"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatCurrency } from "@/lib/commission";
import { type Role } from "@/lib/roles";

type RequestRow = {
  id: number;
  priceCents: number;
  transporterId: number | null;
  unlockedForCurrentUser: boolean;
  unlockedByOtherParty: boolean;
  bothPartiesUnlocked: boolean;
  createdAt: string;
  pickup: string;
  delivery: string;
  cargo: string | null;
};

type RowState = {
  isAccepted: boolean;
  contactsUnlocked: boolean;
  canCompanyUnlock: boolean;
  canOpenDetail: boolean;
  statusLabel: string;
  detailHref: string;
};

function describeRow(request: RequestRow, basePath: string): RowState {
  const isAccepted = Boolean(request.transporterId);
  const contactsUnlocked = request.bothPartiesUnlocked && request.unlockedForCurrentUser;

  return {
    isAccepted,
    contactsUnlocked,
    canCompanyUnlock: request.unlockedByOtherParty === true && request.unlockedForCurrentUser === false,
    // L'azienda apre il dettaglio se la richiesta è stata accettata o se ha già pagato.
    canOpenDetail: isAccepted || request.unlockedForCurrentUser,
    statusLabel: isAccepted ? "Accettata" : "In attesa",
    detailHref: `${basePath}/${request.id}`,
  };
}

export function CompanyRequestsTable({
  requests,
  role,
  basePath,
}: {
  requests: RequestRow[];
  role: Role;
  basePath: string;
}) {
  const router = useRouter();
  const [items] = useState(requests);

  return (
    <div className="space-y-4">
      {/* Sotto i 640px una tabella a 7 colonne è illeggibile: card impilate. */}
      <div className="space-y-3 sm:hidden">
        {items.map((request) => {
          const state = describeRow(request, basePath);

          return (
            <div key={request.id} className="card card-hover space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="stat-mono text-xs text-neutral-500">Richiesta #{request.id}</p>
                  <p className="font-semibold text-textStrong">
                    {request.pickup} → {request.delivery}
                  </p>
                </div>
                <p className="stat-mono text-lg font-bold text-textStrong">
                  {formatCurrency(request.priceCents)}
                </p>
              </div>

              <p className="text-xs text-neutral-600">{request.cargo ?? "Carico non specificato"}</p>

              {state.contactsUnlocked ? <ContactAvailable /> : <ContactPending />}

              <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                <span className="table-meta stat-mono">
                  {state.statusLabel} · {new Date(request.createdAt).toLocaleDateString("it-IT")}
                </span>
                {state.canOpenDetail || state.canCompanyUnlock ? (
                  <Link href={state.detailHref} className="btn-primary min-h-[44px] text-xs">
                    {state.canCompanyUnlock ? "Sblocca contatti" : "Apri dettaglio"}
                  </Link>
                ) : (
                  <span className="text-xs text-neutral-400">Sblocca per aprire</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="table-shell hidden sm:block">
        <table className="min-w-[980px]">
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Percorso</th>
              <th>Carico</th>
              <th>Budget</th>
              <th>Contatto</th>
              <th>Dettaglio</th>
              <th>Pubblicata</th>
            </tr>
          </thead>
          <tbody>
            {items.map((request) => {
              const state = describeRow(request, basePath);

              return (
                <tr
                  key={request.id}
                  className={state.canOpenDetail ? "cursor-pointer" : undefined}
                  onClick={() => {
                    if (state.canOpenDetail) {
                      router.push(state.detailHref);
                    }
                  }}
                >
                  <td className="stat-mono font-semibold text-textStrong">Richiesta #{request.id}</td>
                  <td>
                    {request.pickup} → {request.delivery}
                  </td>
                  <td>{request.cargo ?? "–"}</td>
                  <td className="stat-mono font-semibold text-textStrong">
                    {formatCurrency(request.priceCents)}
                  </td>
                  <td className="space-y-1">
                    {state.contactsUnlocked ? <ContactAvailable /> : <ContactPending />}
                  </td>
                  <td>
                    {state.canCompanyUnlock ? (
                      <Link href={state.detailHref} className="btn-primary min-h-[44px] text-xs">
                        Sblocca contatti
                      </Link>
                    ) : state.canOpenDetail ? (
                      <Link href={state.detailHref} className="btn-secondary min-h-[44px] text-xs">
                        Apri dettaglio
                      </Link>
                    ) : (
                      <span className="text-xs text-neutral-400">Sblocca per aprire</span>
                    )}
                  </td>
                  <td>
                    <div className="space-y-1">
                      <span className="table-meta block">{state.statusLabel}</span>
                      <span className="stat-mono">
                        {new Date(request.createdAt).toLocaleDateString("it-IT")}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactAvailable() {
  return (
    <div className="space-y-1">
      <div className="font-semibold text-textStrong">Referente disponibile</div>
      <div className="text-xs text-neutral-500">Email disponibile</div>
      <div className="text-xs text-neutral-500">Telefono disponibile</div>
      <span className="badge-verified mt-1">Trasporto accettato</span>
    </div>
  );
}

function ContactPending() {
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-accent-200 bg-accent-50/60 p-3 text-sm text-neutral-600">
      <span className="table-chip warning inline-flex items-center gap-2">
        <span className="text-base leading-none">⏳</span> In attesa di trasportatore
      </span>
      <div className="text-xs text-neutral-500">
        I contatti saranno visibili quando un trasportatore accetta.
      </div>
      <div className="space-y-1 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">👤</span>
          <span className="blur-[1px]">Referente nascosto</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">📧</span>
          <span className="stat-mono blur-[1px]">••••@••••</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">📞</span>
          <span className="stat-mono blur-[1px]">•••••••</span>
        </div>
      </div>
    </div>
  );
}
