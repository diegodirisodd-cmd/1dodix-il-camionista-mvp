"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PaywallModal } from "@/components/paywall-modal";
import { formatCurrency } from "@/lib/commission";
import { type Role } from "@/lib/roles";

type RequestRow = {
  id: number;
  priceCents: number;
  contactsUnlockedByTransporter: boolean;
  createdAt: string;
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
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [items, setItems] = useState(requests);
  const activeRequest = items.find((request) => request.id === activeRequestId);

  async function handleUnlock() {
    if (!activeRequestId) return;
    setUnlocking(true);
    const response = await fetch(`/api/requests/${activeRequestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unlock: "transporter" }),
    });

    setUnlocking(false);

    if (!response.ok) {
      setPaywallOpen(false);
      return;
    }

    setItems((prev) =>
      prev.map((request) =>
        request.id === activeRequestId ? { ...request, contactsUnlockedByTransporter: true } : request,
      ),
    );
    setPaywallOpen(false);
    router.push(`${basePath}/${activeRequestId}`);
  }

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
                const unlocked = Boolean(request.contactsUnlockedByTransporter);
                const detailHref = `${basePath}/${request.id}`;
                return (
                <tr key={request.id} className={!unlocked ? "bg-white/70" : undefined}>
                  <td className="text-[#475569]">
                    <span className="font-semibold text-[#0f172a]">Percorso da definire</span>
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
                          Contatti sbloccati – commissione applicata: 2% + IVA
                        </span>
                      </div>
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
                        <div className="text-xs text-[#64748b]">
                          I contatti sono visibili solo dopo lo sblocco.
                        </div>
                        <p className="text-[11px] text-[#64748b]">Commissione 2% + IVA applicata solo su questa richiesta.</p>
                        <div className="space-y-1 text-xs text-[#475569]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">🔒</span>
                            <span className="blur-[1px]">Referente nascosto</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">🔒</span>
                            <span className="blur-[1px]">••••@••••</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b]">🔒</span>
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
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRequestId(request.id);
                          setPaywallOpen(true);
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-[#e2e8f0] px-3 py-2 text-xs font-semibold text-[#0f172a] shadow-sm transition hover:bg-[#f8fafc]"
                      >
                        Sblocca contatti
                      </button>
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

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onConfirm={handleUnlock}
        loading={unlocking}
        priceCents={activeRequest?.priceCents ?? null}
        role={role}
      />
    </div>
  );
}
