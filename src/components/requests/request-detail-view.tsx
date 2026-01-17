"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PaywallModal } from "@/components/paywall-modal";
import { formatCurrency } from "@/lib/commission";
import { type Role } from "@/lib/roles";

type RequestDetailViewProps = {
  requestId: number;
  title: string;
  description: string;
  priceCents: number;
  createdAt: string;
  contactEmail: string | null;
  contactPhone: string | null;
  role: Role;
  unlocked: boolean;
  backHref: string;
  status: string;
  transporterId: number | null;
  acceptedAt: string | null;
};

export function RequestDetailView({
  requestId,
  title,
  description,
  priceCents,
  createdAt,
  contactEmail,
  contactPhone,
  role,
  unlocked,
  backHref,
  status,
  transporterId,
  acceptedAt,
}: RequestDetailViewProps) {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(unlocked);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showUnlockNotice, setShowUnlockNotice] = useState(
    unlocked && !contactEmail && role === "TRANSPORTER",
  );
  const [accepting, setAccepting] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState<string | null>(null);

  const canUnlock = role === "COMPANY" || role === "TRANSPORTER";
  const unlockTarget = role === "COMPANY" ? "company" : "transporter";
  const canAccept = role === "TRANSPORTER" && status === "OPEN" && !transporterId;
  const isAccepted = status === "ACCEPTED";

  const contactHeadline = useMemo(
    () => (role === "TRANSPORTER" ? "Referente aziendale" : "Referente trasportatore"),
    [role],
  );

  const statusLabel = isAccepted ? "Trasporto assegnato" : "In attesa di assegnazione";
  const statusCopy =
    isAccepted
      ? "Trasporto preso in carico da un trasportatore verificato."
      : "Nessun trasportatore ha ancora preso in carico la richiesta.";

  async function handleUnlock() {
    if (!canUnlock) return;
    setUnlocking(true);
    const response = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unlock: unlockTarget }),
    });

    setUnlocking(false);

    if (!response.ok) {
      setPaywallOpen(false);
      return;
    }

    setIsUnlocked(true);
    setShowUnlockNotice(!contactEmail && role === "TRANSPORTER");
    setPaywallOpen(false);
    router.refresh();
  }

  async function handleAcceptTransport() {
    setAccepting(true);
    setAcceptMessage(null);
    const response = await fetch(`/api/requests/${requestId}/accept`, { method: "POST" });
    setAccepting(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setAcceptMessage(data?.error ?? "Impossibile accettare la richiesta");
      return;
    }

    setAcceptMessage("Hai accettato questo trasporto. L’azienda può ora contattarti direttamente.");
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
        ← Torna alle richieste
      </Link>

      <div className="card space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Dettaglio richiesta</p>
          <h1 className="text-3xl font-semibold text-[#0f172a]">{title}</h1>
          <p className="text-sm leading-relaxed text-[#475569]">{description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0f172a]">
            <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[#0f172a]">
              {statusLabel}
            </span>
            {canAccept && (
              <button
                type="button"
                onClick={handleAcceptTransport}
                disabled={accepting}
                className="btn-primary text-xs disabled:cursor-not-allowed"
              >
                {accepting ? "Accettazione..." : "Accetta trasporto"}
              </button>
            )}
          </div>
          <p className="text-sm text-[#475569]">{statusCopy}</p>
          {acceptMessage && (
            <p className="text-sm text-[#0f172a]">{acceptMessage}</p>
          )}
        </div>

        <div className="grid gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm text-[#475569] md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">Valore</p>
            <p className="text-base font-semibold text-[#0f172a]">{formatCurrency(priceCents)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">Pubblicata</p>
            <p>{new Date(createdAt).toLocaleDateString("it-IT")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">ID richiesta</p>
            <p>#{requestId}</p>
          </div>
        </div>
      </div>

      {showUnlockNotice && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[#92400e]">
          Richiesta sbloccata. Ricarica la pagina se non vedi ancora i dettagli.
        </div>
      )}

      {role === "COMPANY" && isAccepted && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
          <p className="font-semibold">Trasporto accettato</p>
          <p className="text-sm text-[#475569]">
            Email trasportatore: {contactEmail ?? "Email non disponibile"}
          </p>
          <p className="text-sm text-[#475569]">
            Telefono trasportatore: {contactPhone ?? "Telefono non disponibile"}
          </p>
          <p className="text-sm text-[#475569]">
            Data accettazione:{" "}
            {acceptedAt ? new Date(acceptedAt).toLocaleString("it-IT") : "Non disponibile"}
          </p>
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#0f172a]">Contatti</h2>
            <p className="text-sm text-[#475569]">
              {isUnlocked ? "Contatti sbloccati per questa richiesta." : "Sblocca per accedere ai contatti completi."}
            </p>
          </div>
          {!isUnlocked && canUnlock && (
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Sblocca contatti
            </button>
          )}
        </div>

        {isUnlocked ? (
          <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
            <p className="font-semibold">{contactHeadline}</p>
            <p className="text-sm text-[#475569]">{contactEmail ?? "Email non disponibile"}</p>
            <p className="text-sm text-[#475569]">
              {contactPhone ? contactPhone : "Telefono non disponibile"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-dashed border-[#f5c76a]/80 bg-[#fff8ed] p-4 text-sm text-[#475569]">
            <div className="flex items-center justify-between gap-2">
              <span className="table-chip warning inline-flex items-center gap-2">
                <span className="text-base leading-none">🔒</span> Contatti bloccati
              </span>
            </div>
            <div className="text-xs text-[#64748b]">I contatti completi sono visibili solo dopo lo sblocco.</div>
            <div className="space-y-1 text-xs text-[#475569]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748b]">🔒</span>
                <span className="blur-[1px]">{contactHeadline}</span>
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
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onConfirm={handleUnlock}
        loading={unlocking}
        priceCents={priceCents}
        role={role}
      />
    </section>
  );
}
