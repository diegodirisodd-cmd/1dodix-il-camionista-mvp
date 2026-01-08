"use client";

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
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactsUnlockedByCompany: boolean;
  createdAt: string;
};

export function CompanyRequestsTable({
  requests,
  role,
}: {
  requests: RequestRow[];
  role: Role;
}) {
  const [items, setItems] = useState(requests);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  async function handleUnlock() {
    if (!activeRequestId) return;
    setUnlocking(true);
    const response = await fetch(`/api/requests/${activeRequestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unlock: "company" }),
    });

    setUnlocking(false);

    if (!response.ok) {
      setPaywallOpen(false);
      return;
    }

    setItems((prev) =>
      prev.map((request) =>
        request.id === activeRequestId ? { ...request, contactsUnlockedByCompany: true } : request,
      ),
    );
    setPaywallOpen(false);
  }

  return (
    <div className="card space-y-3">
      <div className="table-shell overflow-x-auto">
        <table className="min-w-[980px]">
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Percorso</th>
              <th>Carico</th>
              <th>Budget</th>
              <th>Contatto</th>
              <th>Pubblicata</th>
            </tr>
          </thead>
          <tbody>
            {items.map((request) => {
              const unlocked = Boolean(request.contactsUnlockedByCompany);
              return (
                <tr key={request.id} className={!unlocked ? "bg-white/70" : undefined}>
                  <td className="font-semibold text-[#0f172a]">{request.title}</td>
                  <td className="text-[#475569]">
                    {request.pickup} → {request.dropoff}
                  </td>
                  <td className="text-[#475569]">{request.cargo ?? "—"}</td>
                  <td className="text-[#475569]">{request.budget ?? "—"}</td>
                  <td className="space-y-1 text-[#475569]">
                    {unlocked ? (
                      <>
                        <div className="font-semibold text-[#0f172a]">{request.contactName}</div>
                        <div className="text-xs text-[#64748b]">{request.contactEmail}</div>
                        <div className="text-xs text-[#64748b]">{request.contactPhone}</div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          Contatti sbloccati
                        </span>
                      </>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-dashed border-[#f5c76a]/80 bg-[#fff8ed] p-3 text-sm text-[#475569]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="table-chip warning inline-flex items-center gap-2">
                            <span className="text-base leading-none">🔒</span> Contatti bloccati
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRequestId(request.id);
                              setPaywallOpen(true);
                            }}
                            className="rounded-full border border-[#e2e8f0] px-3 py-1 text-xs font-semibold text-[#0f172a] transition hover:bg-[#f8fafc]"
                          >
                            Sblocca contatti
                          </button>
                        </div>
                        <div className="text-xs text-[#64748b]">I contatti sono visibili solo dopo lo sblocco.</div>
                        <p className="text-[11px] text-[#64748b]">Commissione 2% applicata solo su questa richiesta.</p>
                        <div className="space-y-1 text-xs text-[#475569]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">🔒</span>
                            <span className="blur-[1px]">{request.contactName ?? "Referente nascosto"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">🔒</span>
                            <span className="blur-[1px]">{request.contactEmail ?? "••••@••••"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">🔒</span>
                            <span className="blur-[1px]">{request.contactPhone ?? "••••••"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onConfirm={handleUnlock}
        loading={unlocking}
        role={role}
      />
    </div>
  );
}
