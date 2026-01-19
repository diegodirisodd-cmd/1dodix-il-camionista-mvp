"use client";

import Link from "next/link";
import { useState } from "react";

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

  if (items.length === 0) {
    return (
      <div className="card text-sm leading-relaxed text-[#475569]">
        Non hai ancora trasporti accettati.
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
            <th>Trasportatore</th>
            <th>Stato</th>
            <th>Pubblicata</th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {items.map((request) => {
            const detailHref = `/dashboard/company/requests/${request.id}`;
            return (
              <tr key={request.id} className="cursor-pointer">
                <td className="text-[#475569]">
                  <Link href={detailHref} className="font-semibold text-[#0f172a] hover:underline">
                    Percorso da definire
                  </Link>
                </td>
                <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                <td className="text-[#475569]">{formatCurrency(request.price)}</td>
                <td className="text-[#475569]">{request.transporter?.email ?? "—"}</td>
                <td className="text-[#475569]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Trasporto accettato
                  </span>
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
