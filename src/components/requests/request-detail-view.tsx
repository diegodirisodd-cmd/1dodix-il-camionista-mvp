"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/commission";
import { type Role } from "@/lib/roles";

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

type RequestDetailViewProps = {
  requestId: number;
  title: string;
  description: string;
  cargo: string | null;
  priceCents: number;
  createdAt: string;
  companyEmail: string;
  contactEmail: string | null;
  contactPhone: string | null;
  transporterEmail: string | null;
  role: Role;
  unlocked: boolean;
  backHref: string;
  transporterId: number | null;
  assignedToSelf: boolean;
  assignedToOther: boolean;
};

export function RequestDetailView({
  requestId,
  title,
  description,
  cargo,
  priceCents,
  createdAt,
  companyEmail,
  contactEmail,
  contactPhone,
  transporterEmail,
  role,
  unlocked,
  backHref,
  transporterId,
  assignedToSelf,
  assignedToOther,
}: RequestDetailViewProps) {
  const router = useRouter();
  const isUnlocked = unlocked;
  const [accepting, setAccepting] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [localUnlocked, setLocalUnlocked] = useState(false);

  const canAccept = role === "TRANSPORTER" && !transporterId;
  const isAccepted = Boolean(transporterId);
  const isUnlockedFinal = isUnlocked || localUnlocked;

  const contactHeadline = useMemo(
    () => (role === "TRANSPORTER" ? "Referente aziendale" : "Referente trasportatore"),
    [role],
  );

  const statusLabel = isAccepted ? "Trasporto accettato" : "In attesa di assegnazione";
  const statusCopy = isAccepted
    ? "Trasporto preso in carico da un trasportatore verificato."
    : "Nessun trasportatore ha ancora preso in carico la richiesta.";

  const transportValue = priceCents / 100;
  const commission = transportValue * 0.02;
  const iva = commission * 0.22;
  const total = commission + iva;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unlockStored = window.localStorage.getItem("unlockedRequests");
    if (unlockStored) {
      try {
        const parsed = JSON.parse(unlockStored) as { COMPANY?: number[]; TRANSPORTER?: number[] };
        const list = role === "COMPANY" ? parsed.COMPANY ?? [] : parsed.TRANSPORTER ?? [];
        if (list.includes(requestId)) {
          setLocalUnlocked(true);
        }
      } catch {
        // ignore malformed data
      }
    }
    const stored = window.localStorage.getItem("completedRequests");
    if (!stored) return;
    try {
      const ids = JSON.parse(stored) as number[];
      setCompleted(ids.includes(requestId));
    } catch {
      // ignore malformed data
    }
  }, [requestId]);

  function handleMarkCompleted() {
    const confirmed = window.confirm("Confermi di voler segnare il trasporto come completato?");
    if (!confirmed) return;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("completedRequests");
      try {
        const ids = stored ? (JSON.parse(stored) as number[]) : [];
        if (!ids.includes(requestId)) {
          const next = [...ids, requestId];
          window.localStorage.setItem("completedRequests", JSON.stringify(next));
        }
      } catch {
        window.localStorage.setItem("completedRequests", JSON.stringify([requestId]));
      }
    }
    setCompleted(true);
    setAcceptMessage("Trasporto completato con successo.");
  }

  async function handleUnlockContacts() {
    if (unlocking) return;
    setUnlocking(true);
    try {
      const price = priceCents / 100;
      const commission = price * 0.02;
      const vat = commission * 0.22;
      const totalCents = Math.round((commission + vat) * 100);
      const totalEuro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
        totalCents / 100,
      );

      const confirmed = window.confirm(
        `Sbloccando i contatti pagherai una commissione del 2% + IVA.\nImporto totale: ${totalEuro}`,
      );
      if (!confirmed) {
        return;
      }

      const response = await fetch("/api/stripe/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      if (!response.ok) {
        console.error("Errore sblocco contatti", await response.text());
        alert("Impossibile avviare il pagamento per lo sblocco contatti.");
        return;
      }
      const payload = (await response.json()) as { url?: string };
      if (payload.url) {
        window.location.href = payload.url;
        return;
      }
      alert("URL pagamento non disponibile.");
    } catch (error) {
      console.error("Errore sblocco contatti", error);
      alert("Impossibile avviare il pagamento per lo sblocco contatti.");
    } finally {
      setUnlocking(false);
    }
  }

  async function handleAcceptTransport() {
    setAccepting(true);
    setAcceptMessage(null);
    const response = await fetch(`/api/requests/${requestId}/accept`, { method: "PATCH" });
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
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#0f172a]">
            <span className="rounded-full bg-[#f1f5f9] px-3 py-1">Carico: {cargo ?? "—"}</span>
            <span className="rounded-full bg-[#f1f5f9] px-3 py-1">Email azienda: {companyEmail}</span>
            {isAccepted && transporterEmail ? (
              <span className="rounded-full bg-[#f1f5f9] px-3 py-1">Email trasportatore: {transporterEmail}</span>
            ) : null}
          </div>
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
          {role === "COMPANY" && isAccepted && !completed && (
            <button
              type="button"
              onClick={handleMarkCompleted}
              className="btn-secondary text-xs"
            >
              Segna come completato
            </button>
          )}
          {completed && (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              Trasporto completato
            </span>
          )}
          <p className="text-sm text-[#475569]">{statusCopy}</p>
          {acceptMessage && (
            <p className="text-sm text-[#0f172a]">{acceptMessage}</p>
          )}
          {role === "TRANSPORTER" && assignedToOther && (
            <p className="text-sm text-[#0f172a]">Trasporto già accettato.</p>
          )}
          {role === "TRANSPORTER" && assignedToSelf && (
            <p className="text-sm text-[#0f172a]">Sei il trasportatore assegnato.</p>
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

      {role === "COMPANY" && isAccepted && isUnlockedFinal && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
          <p className="font-semibold">Trasporto accettato</p>
          <p className="text-sm text-[#475569]">
            Email trasportatore: {contactEmail ?? "Email non disponibile"}
          </p>
          <p className="text-sm text-[#475569]">
            Telefono trasportatore: {contactPhone ?? "Telefono non disponibile"}
          </p>
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#0f172a]">Contatti</h2>
            <p className="text-sm text-[#475569]">
              {isUnlockedFinal
                ? "Contatti disponibili per questa richiesta."
                : "I contatti completi sono visibili dopo l’accettazione."}
            </p>
          </div>
          {!isUnlockedFinal && (
            <p className="text-xs text-[#64748b]">I contatti completi sono visibili dopo l&apos;accettazione.</p>
          )}
        </div>

        {isUnlockedFinal ? (
          <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
            <p className="font-semibold">{contactHeadline}</p>
            <p className="text-sm text-[#475569]">{contactEmail ?? "Email non disponibile"}</p>
            <p className="text-sm text-[#475569]">
              {contactPhone ? contactPhone : "Telefono non disponibile"}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              Contatti sbloccati
            </span>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-dashed border-[#f5c76a]/80 bg-[#fff8ed] p-4 text-sm text-[#475569]">
            <div className="flex items-center justify-between gap-2">
              <span className="table-chip warning inline-flex items-center gap-2">
                <span className="text-base leading-none">⏳</span> Contatti in attesa
              </span>
            </div>
            <div className="text-xs text-[#64748b]">I contatti completi sono visibili dopo l&apos;accettazione.</div>
            <div className="space-y-1 text-xs text-[#475569]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748b]">⏳</span>
                <span className="blur-[1px]">{contactHeadline}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748b]">⏳</span>
                <span className="blur-[1px]">••••@••••</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748b]">⏳</span>
                <span className="blur-[1px]">••••••</span>
              </div>
            </div>
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 text-sm text-[#0f172a] shadow-sm">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Sblocca contatti</p>
                <p className="text-sm text-[#475569]">
                  Per sbloccare i contatti è richiesta una commissione di servizio. La commissione viene applicata
                  solo a trasporto concluso.
                </p>
                <p className="text-xs font-medium text-[#475569]">
                  Nessun abbonamento, paghi solo quando lavori. Trasparenza totale, nessun costo nascosto.
                </p>
              </div>
              <div className="mt-4 space-y-2 rounded-lg bg-[#f8fafc] p-3">
                <div className="flex items-center justify-between text-xs text-[#475569]">
                  <span>Importo trasporto</span>
                  <span className="font-semibold text-[#0f172a]">{euroFormatter.format(transportValue)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#475569]">
                  <span>Commissione DodiX (2%)</span>
                  <span>{euroFormatter.format(commission)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#475569]">
                  <span>IVA 22%</span>
                  <span>{euroFormatter.format(iva)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]">
                  <span>Totale</span>
                  <span>{euroFormatter.format(total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUnlockContacts}
                className="btn-primary mt-4 w-full disabled:cursor-not-allowed"
                disabled={unlocking}
              >
                {unlocking ? "Pagamento..." : "Sblocca contatti"}
              </button>
              <p className="mt-3 text-xs text-[#64748b]">Commissione applicata solo quando il contatto è utile.</p>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
