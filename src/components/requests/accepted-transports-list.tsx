"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/commission";

type AcceptedRequest = {
  id: number;
  cargo: string | null;
  price: number;
  createdAt: string;
  company: { email: string };
};

type AcceptedTransportsListProps = {
  requests: AcceptedRequest[];
};

export function AcceptedTransportsList({ requests }: AcceptedTransportsListProps) {
  const [items] = useState(requests);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  const empty = items.length === 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("completedRequests");
    if (!stored) return;
    try {
      const ids = JSON.parse(stored) as number[];
      setCompletedIds(new Set(ids));
    } catch {
      // ignore malformed data
    }
  }, []);

  if (empty) {
    return (
      <div className="card text-sm leading-relaxed text-[#475569]">
        Non hai ancora accettato nessun trasporto.
      </div>
    );
  }

  return (
    <div className="table-shell overflow-x-auto">
      <table className="min-w-[960px]">
        <thead>
          <tr>
            <th>Percorso</th>
            <th>Carico</th>
            <th>Budget</th>
            <th>Azienda</th>
            <th>Stato</th>
            <th>Pubblicata</th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {items.map((request) => {
            const detailHref = `/dashboard/transporter/requests/${request.id}`;
            const isCompleted = completedIds.has(request.id);
            return (
              <tr key={request.id} className="cursor-pointer">
                <td className="text-[#475569]">
                  <Link href={detailHref} className="font-semibold text-[#0f172a] hover:underline">
                    Percorso da definire
                  </Link>
                </td>
                <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                <td className="text-[#475569]">{formatCurrency(request.price)}</td>
                <td className="text-[#475569]">{request.company.email}</td>
                <td className="text-[#475569]">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      Completato
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      Trasporto accettato
                    </span>
                  )}
                </td>
                <td className="text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                <td className="text-[#475569]">
                  <Link
                    href={detailHref}
                    className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    Apri dettaglio
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
