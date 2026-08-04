"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/commission";

type CompanyHistoryItem = {
  id: number;
  price: number;
  createdAt: string;
  cargo: string | null;
  transporter: { email: string } | null;
};

type CompanyHistoryListProps = {
  requests: CompanyHistoryItem[];
};

export function CompanyHistoryList({ requests }: CompanyHistoryListProps) {
  const [items] = useState(requests);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

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

  if (items.length === 0) {
    return (
      <div className="card-muted text-sm leading-relaxed text-neutral-600">
        Non hai ancora trasporti accettati.
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table className="min-w-[960px]">
        <thead>
          <tr>
            <th>Percorso</th>
            <th>Carico</th>
            <th>Budget</th>
            <th>Trasportatore</th>
            <th>Stato</th>
            <th>Pubblicata</th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {items.map((request) => {
            const detailHref = `/dashboard/company/requests/${request.id}`;
            const isCompleted = completedIds.has(request.id);
            return (
              <tr key={request.id} className="cursor-pointer">
                <td className="text-neutral-600">
                  <Link href={detailHref} className="font-semibold text-textStrong hover:underline">
                    Percorso da definire
                  </Link>
                </td>
                <td className="text-neutral-600">{request.cargo ?? "—"}</td>
                <td className="stat-mono font-semibold text-textStrong">{formatCurrency(request.price)}</td>
                <td className="text-neutral-600">{request.transporter?.email ?? "—"}</td>
                <td className="text-neutral-600">
                  <span className="badge-verified">
                    {isCompleted ? "Completato" : "Trasporto accettato"}
                  </span>
                </td>
                <td className="stat-mono">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                <td className="text-neutral-600">
                  <Link
                    href={detailHref}
                    className="btn-secondary min-h-[44px] text-xs"
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
