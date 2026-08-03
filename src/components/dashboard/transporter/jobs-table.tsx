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
  unlockedForCurrentUser: boolean;
  bothPartiesUnlocked: boolean;
  createdAt: string;
  pickup: string;
  delivery: string;
  cargo: string | null;
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

  if (items.length === 0) {
    return (
      <p className="card-muted text-sm leading-relaxed text-neutral-600">
        Nessuna richiesta presente. Torna a controllare più tardi.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card impilate sotto i 640px, tabella densa solo da sm in su. */}
      <div className="space-y-3 sm:hidden">
        {items.map((request) => {
          const contactsUnlocked = request.bothPartiesUnlocked && request.unlockedForCurrentUser;
          const detailHref = `${basePath}/${request.id}`;

          return (
            <div key={request.id} className="card card-hover space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-textStrong">
                  {request.pickup} → {request.delivery}
                </p>
                <p className="stat-mono text-lg font-bold text-textStrong">
                  {formatCurrency(request.priceCents)}
                </p>
              </div>

              <p className="text-xs text-neutral-600">{request.cargo ?? "Carico non specificato"}</p>

              {contactsUnlocked ? <ContactAvailable /> : <ContactPending />}

              <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                <span className="table-meta stat-mono">
                  {new Date(request.createdAt).toLocaleDateString("it-IT")}
                </span>
                <Link href={detailHref} className="btn-primary min-h-[44px] text-xs">
                  Apri dettaglio
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="table-shell hidden sm:block">
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
              const contactsUnlocked = request.bothPartiesUnlocked && request.unlockedForCurrentUser;
              const detailHref = `${basePath}/${request.id}`;

              return (
                <tr
                  key={request.id}
                  className="cursor-pointer"
                  onClick={() => {
                    router.push(detailHref);
                  }}
                >
                  <td>
                    <span className="font-semibold text-textStrong">
                      {request.pickup} → {request.delivery}
                    </span>
                  </td>
                  <td>{request.cargo ?? "—"}</td>
                  <td className="stat-mono font-semibold text-textStrong">
                    {formatCurrency(request.priceCents)}
                  </td>
                  <td>{contactsUnlocked ? <ContactAvailable /> : <ContactPending />}</td>
                  <td>
                    <Link href={detailHref} className="btn-secondary min-h-[44px] text-xs">
                      Apri dettaglio
                    </Link>
                  </td>
                  <td className="stat-mono">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactAvailable() {
  return (
    <div className="space-y-1">
      <div className="font-semibold text-textStrong">Referente disponibile</div>
      <div className="text-xs text-neutral-500">Email disponibile</div>
      <div className="text-xs text-neutral-500">Telefono disponibile</div>
      <span className="badge-verified mt-1">Trasporto accettato</span>
    </div>
  );
}

function ContactPending() {
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-accent-200 bg-accent-50/60 p-3 text-sm text-neutral-600">
      <span className="table-chip warning inline-flex items-center gap-2">
        <span className="text-base leading-none">⏳</span> In attesa di assegnazione
      </span>
      <div className="text-xs text-neutral-500">Apri il dettaglio per accettare il trasporto.</div>
      <div className="space-y-1 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">⏳</span>
          <span className="blur-[1px]">Referente nascosto</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">⏳</span>
          <span className="stat-mono blur-[1px]">••••@••••</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">⏳</span>
          <span className="stat-mono blur-[1px]">••••••</span>
        </div>
      </div>
    </div>
  );
}
