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
                      </>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-dashed border-[#f5c76a]/80 bg-[#fff8ed] p-3 text-sm text-[#475569]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="table-chip warning inline-flex items-center gap-2">
                            <span className="text-base leading-none">🔒</span> Accesso limitato
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRequestId(request.id);
                              setPaywallOpen(true);
                            }}
                            className="text-xs font-semibold text-[#0f172a] underline-offset-4 hover:underline"
                          >
                            Sblocca contatti (commissione 2%)
                          </button>
                        </div>
                        <div className="text-xs text-[#64748b]">Contatti oscurati fino allo sblocco con commissione.</div>
                        <div className="space-y-1 text-xs text-[#475569]">
                          <div className="blur-[1px]">{request.contactName ?? "Referente nascosto"}</div>
                          <div className="blur-[1px]">{request.contactEmail ?? "••••@••••"}</div>
                          <div className="blur-[1px]">{request.contactPhone ?? "••••••"}</div>
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
