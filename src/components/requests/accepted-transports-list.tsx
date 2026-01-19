"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/commission";

type TransportStatus = "ACCETTATO" | "IN_CORSO" | "COMPLETATO";

type AcceptedRequest = {
  id: number;
  pickup: string;
  delivery: string;
  price: number;
  createdAt: string;
  status: TransportStatus;
  company: { email: string };
};

type AcceptedTransportsListProps = {
  requests: AcceptedRequest[];
};

const statusStyles: Record<TransportStatus, string> = {
  ACCETTATO: "bg-amber-50 text-amber-700 ring-amber-200",
  IN_CORSO: "bg-blue-50 text-blue-700 ring-blue-200",
  COMPLETATO: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const statusLabel: Record<TransportStatus, string> = {
  ACCETTATO: "Accettato",
  IN_CORSO: "In corso",
  COMPLETATO: "Completato",
};

export function AcceptedTransportsList({ requests }: AcceptedTransportsListProps) {
  const [items, setItems] = useState(requests);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const empty = useMemo(() => items.length === 0, [items.length]);

  async function handleStatusUpdate(requestId: number, nextStatus: "IN_CORSO" | "COMPLETATO") {
    setLoadingId(requestId);
    setMessage(null);
    const endpoint = nextStatus === "IN_CORSO" ? "start" : "complete";

    try {
      const response = await fetch(`/api/requests/${requestId}/${endpoint}`, { method: "POST" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setMessage(payload?.error ?? "Impossibile aggiornare lo stato del trasporto.");
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item.id === requestId ? { ...item, status: nextStatus } : item)),
      );
      setMessage(nextStatus === "IN_CORSO" ? "Trasporto avviato." : "Trasporto completato con successo.");
    } catch (error) {
      console.error("Errore aggiornamento stato trasporto", error);
      setMessage("Impossibile aggiornare lo stato del trasporto.");
    } finally {
      setLoadingId(null);
    }
  }

  if (empty) {
    return (
      <div className="card text-sm leading-relaxed text-[#475569]">
        Non hai ancora accettato nessun trasporto.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {message && <p className="alert-success">{message}</p>}
      <div className="table-shell overflow-x-auto">
        <table className="min-w-[960px]">
          <thead>
            <tr>
              <th>Percorso</th>
              <th>Azienda</th>
              <th>Budget</th>
              <th>Stato</th>
              <th>Pubblicata</th>
              <th>Azione</th>
            </tr>
          </thead>
          <tbody>
            {items.map((request) => {
              const detailHref = `/dashboard/transporter/requests/${request.id}`;
              const isLoading = loadingId === request.id;
              return (
                <tr key={request.id} className="cursor-pointer">
                  <td className="text-[#475569]">
                    <Link href={detailHref} className="font-semibold text-[#0f172a] hover:underline">
                      {request.pickup} → {request.delivery}
                    </Link>
                  </td>
                  <td className="text-[#475569]">{request.company.email}</td>
                  <td className="text-[#475569]">{formatCurrency(request.price)}</td>
                  <td className="text-[#475569]">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${statusStyles[request.status]}`}
                    >
                      {statusLabel[request.status]}
                    </span>
                  </td>
                  <td className="text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                  <td className="text-[#475569]">
                    {request.status === "ACCETTATO" && (
                      <button
                        type="button"
                        className="btn-secondary text-xs disabled:cursor-not-allowed"
                        onClick={() => handleStatusUpdate(request.id, "IN_CORSO")}
                        disabled={isLoading}
                      >
                        {isLoading ? "Avvio..." : "Avvia trasporto"}
                      </button>
                    )}
                    {request.status === "IN_CORSO" && (
                      <button
                        type="button"
                        className="btn-primary text-xs disabled:cursor-not-allowed"
                        onClick={() => handleStatusUpdate(request.id, "COMPLETATO")}
                        disabled={isLoading}
                      >
                        {isLoading ? "Completamento..." : "Segna come completato"}
                      </button>
                    )}
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
