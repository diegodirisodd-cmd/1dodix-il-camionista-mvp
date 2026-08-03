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
      <div className="card-muted text-sm leading-relaxed text-neutral-600">
        Non hai ancora accettato nessun trasporto.
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
                <td className="text-neutral-600">
                  <Link href={detailHref} className="font-semibold text-textStrong hover:underline">
                    Percorso da definire
                  </Link>
                </td>
                <td className="text-neutral-600">{request.cargo ?? "—"}</td>
                <td className="stat-mono font-semibold text-textStrong">{formatCurrency(request.price)}</td>
                <td className="text-neutral-600">{request.company.email}</td>
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
