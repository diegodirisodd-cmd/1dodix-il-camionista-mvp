"use client";

import Link from "next/link";
import { useState } from "react";

import { PaywallModal } from "@/components/paywall-modal";
import { type Role } from "@/lib/roles";

type RequestRow = {
  id: number;
  title: string;
  pickup: string;
  dropoff: string;
  cargo: string | null;
  budget: string | null;
  description: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
};

export function TransporterJobsTable({
  requests,
  subscriptionActive,
  role,
}: {
  requests: RequestRow[];
  subscriptionActive: boolean;
  role: Role;
}) {
  const [paywallOpen, setPaywallOpen] = useState(false);

  return (
    <div className="space-y-4">
      {!subscriptionActive && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#f5c76a] bg-white p-4 text-sm text-[#475569] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Accesso limitato</p>
              <p className="text-base font-semibold text-[#0f172a]">Stai esplorando con l’account base</p>
              <p className="text-xs text-[#475569]">Puoi vedere le richieste ma i contatti restano protetti finché non sblocchi l’operatività.</p>
            </div>
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f5c76a] to-[#f29f58] px-4 py-2 text-xs font-semibold text-[#0f172a] shadow-sm transition hover:brightness-95"
            >
              Sblocca operatività
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
            <span>✔ Contatti diretti verificati</span>
            <span>✔ Nessuna intermediazione</span>
            <span>✔ Priorità nelle richieste</span>
            <span>✔ Disdici quando vuoi</span>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-sm leading-relaxed text-[#475569]">Nessuna richiesta presente. Torna a controllare più tardi.</p>
      ) : (
        <div className="table-shell overflow-x-auto">
          <table className="min-w-[960px]">
            <thead>
              <tr>
                <th>Percorso</th>
                <th>Carico</th>
                <th>Budget</th>
                <th>Contatti</th>
                <th>Azione</th>
                <th>Pubblicata</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className={!subscriptionActive ? "bg-white/70" : undefined}>
                  <td className="text-[#475569]">
                    <span className="font-semibold text-[#0f172a]">{request.pickup}</span> → {request.dropoff}
                  </td>
                  <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                  <td className="text-[#475569]">{request.budget ?? "—"}</td>
                  <td className="text-[#475569]">
                    {subscriptionActive ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-[#0f172a]">{request.contactName ?? "—"}</div>
                        <div className="text-xs text-[#64748b]">{request.contactEmail ?? "—"}</div>
                        <div className="text-xs text-[#64748b]">{request.contactPhone ?? "—"}</div>
                      </div>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-dashed border-[#f5c76a]/80 bg-[#fff8ed] p-3 text-sm text-[#475569]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="table-chip warning inline-flex items-center gap-2">
                            <span className="text-base leading-none">🔒</span> Accesso limitato
                          </span>
                          <button
                            type="button"
                            onClick={() => setPaywallOpen(true)}
                            className="text-xs font-semibold text-[#0f172a] underline-offset-4 hover:underline"
                          >
                            Sblocca contatti
                          </button>
                        </div>
                        <div className="text-xs text-[#64748b]">Contatti sfocati fino all’attivazione dell’accesso operativo completo.</div>
                        <div className="space-y-1 text-xs text-[#475569]">
                          <div className="blur-[1px]">{request.contactName ?? "Referente nascosto"}</div>
                          <div className="blur-[1px]">{request.contactEmail ?? "••••@••••"}</div>
                          <div className="blur-[1px]">{request.contactPhone ?? "••••••"}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="text-[#475569]">
                    {subscriptionActive && request.contactEmail ? (
                      <Link
                        href={`mailto:${request.contactEmail}`}
                        className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
                      >
                        Rispondi alla richiesta
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPaywallOpen(true)}
                        className="inline-flex items-center justify-center rounded-full border border-[#f5c76a] px-3 py-2 text-xs font-semibold text-[#0f172a] shadow-sm transition hover:bg-[#fff5e6]"
                      >
                        Sblocca operatività
                      </button>
                    )}
                  </td>
                  <td className="text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} role={role} />
    </div>
  );
}
