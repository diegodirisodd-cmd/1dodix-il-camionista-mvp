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
  createdAt: string;
  pickup: string;
  delivery: string;
};

export function TransporterJobsTable({
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
      {items.length === 0 ? (
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
              {items.map((request) => {
                const unlocked = Boolean(request.transporterId);
                const detailHref = `${basePath}/${request.id}`;
                return (
                <tr
                  key={request.id}
                  className={!unlocked ? "bg-white/70" : "cursor-pointer"}
                  onClick={() => {
                    if (unlocked) {
                      router.push(detailHref);
                    }
                  }}
                >
                  <td className="text-[#475569]">
                    <span className="font-semibold text-[#0f172a]">{request.pickup} → {request.delivery}</span>
                  </td>
                  <td className="text-[#475569]">—</td>
                  <td className="text-[#475569]">{formatCurrency(request.priceCents)}</td>
                  <td className="text-[#475569]">
                    {unlocked ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-[#0f172a]">Referente disponibile</div>
                        <div className="text-xs text-[#64748b]">Email disponibile</div>
                        <div className="text-xs text-[#64748b]">Telefono disponibile</div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          Trasporto accettato
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-dashed border-[#f5c76a]/80 bg-[#fff8ed] p-3 text-sm text-[#475569]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="table-chip warning inline-flex items-center gap-2">
                            <span className="text-base leading-none">⏳</span> In attesa di assegnazione
                          </span>
                        </div>
                        <div className="text-xs text-[#64748b]">
                          I contatti completi sono visibili dopo l&apos;accettazione.
                        </div>
                        <div className="space-y-1 text-xs text-[#475569]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">⏳</span>
                            <span className="blur-[1px]">Referente nascosto</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">⏳</span>
                            <span className="blur-[1px]">••••@••••</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">⏳</span>
                            <span className="blur-[1px]">••••••</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="text-[#475569]">
                    {unlocked ? (
                      <Link
                        href={detailHref}
                        className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
                      >
                        Apri dettaglio
                      </Link>
                    ) : (
                      <span className="text-xs text-[#94a3b8]">Accetta per procedere</span>
                    )}
                  </td>
                  <td className="text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
