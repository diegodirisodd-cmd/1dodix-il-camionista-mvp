"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/commission";
import { type Role } from "@/lib/roles";

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const CARGO_LABELS: Record<string, string> = {
  pallet: "Pallet",
  colli: "Colli / Pacchi",
  sfuso: "Sfuso",
  container: "Container",
  frigo: "Merce refrigerata",
  adr: "ADR / Merci pericolose",
  liquidi: "Liquidi / Cisterna",
  altro: "Altro",
};

const VEHICLE_LABELS: Record<string, string> = {
  bilico: "Bilico (13.6m)",
  motrice: "Motrice",
  furgone: "Furgone",
  furgone_frigo: "Furgone frigo",
  frigo: "Semirimorchio frigo",
  cisterna: "Cisterna",
  pianale: "Pianale",
  centinato: "Centinato",
  ribaltabile: "Ribaltabile",
  altro: "Altro",
};

const PAYMENT_LABELS: Record<string, string> = {
  bonifico_30: "Bonifico 30 giorni",
  bonifico_60: "Bonifico 60 giorni",
  bonifico_immediato: "Bonifico immediato",
  contrassegno: "Contrassegno",
  altro: "Altro",
};

type RequestDetailViewProps = {
  requestId: number;
  title: string;
  description: string;
  cargo: string | null;
  priceCents: number;
  createdAt: string;
  acceptedAt: string | null;
  companyEmail: string;
  companyName?: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  transporterEmail: string | null;
  role: Role;
  unlockedForCurrentUser: boolean;
  unlockedByOtherParty: boolean;
  bothPartiesUnlocked: boolean;
  backHref: string;
  assignedToSelf: boolean;
  assignedToOther: boolean;
  pickupDate?: string | null;
  deliveryDate?: string | null;
  cargoType?: string | null;
  weight?: number | null;
  volume?: string | null;
  palletCount?: number | null;
  vehicleType?: string | null;
  isAdr?: boolean;
  paymentTerms?: string | null;
  pickupContact?: string | null;
  pickupPhone?: string | null;
  distanceKm?: number | null;
};

function InfoCell({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-[#64748b]">{label}</p>
      <p className="text-sm font-medium text-[#0f172a]">{value}</p>
    </div>
  );
}

export function RequestDetailView({
  requestId,
  title,
  description,
  cargo,
  priceCents,
  createdAt,
  acceptedAt,
  companyEmail,
  companyName,
  contactEmail,
  contactPhone,
  transporterEmail,
  role,
  unlockedForCurrentUser,
  unlockedByOtherParty,
  bothPartiesUnlocked,
  backHref,
  assignedToSelf,
  assignedToOther,
  pickupDate,
  deliveryDate,
  cargoType,
  weight,
  volume,
  palletCount,
  vehicleType,
  isAdr,
  paymentTerms,
  pickupContact,
  pickupPhone,
  distanceKm,
}: RequestDetailViewProps) {
  const acceptedAtDate = acceptedAt ? new Date(acceptedAt) : null;
  const [acceptMessage, setAcceptMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const isAccepted = Boolean(acceptedAtDate);
  const contactsVisible = bothPartiesUnlocked && unlockedForCurrentUser;
  const hasPaid = role === "ADMIN" ? true : unlockedForCurrentUser;

  const canCompanyUnlock =
    role === "COMPANY" && unlockedByOtherParty === true && unlockedForCurrentUser === false;
  const shouldShowCta =
    role === "COMPANY" ? canCompanyUnlock : role === "TRANSPORTER" ? !unlockedForCurrentUser : false;

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

  const fmtDate = (iso: string | null | undefined) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("completedRequests");
    if (!stored) return;
    try {
      const ids = JSON.parse(stored) as number[];
      setCompleted(ids.includes(requestId));
    } catch { /* ignore */ }
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
      const totalCents = Math.round(total * 100);
      const totalEuro = euroFormatter.format(totalCents / 100);
      const confirmed = window.confirm(
        `Sbloccando i contatti pagherai una commissione del 2% + IVA.\nImporto totale: ${totalEuro}`,
      );
      if (!confirmed) return;

      const response = await fetch(
        role === "COMPANY" ? "/api/stripe/checkout" : "/api/stripe/unlock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            role === "COMPANY"
              ? { requestId, userRole: "company", amount: totalCents }
              : { requestId },
          ),
        },
      );

      if (!response.ok) {
        alert("Impossibile avviare il pagamento per lo sblocco contatti.");
        return;
      }

      const payload = (await response.json()) as { url?: string };
      if (payload?.url) {
        window.location.href = payload.url;
      } else {
        alert("URL pagamento non disponibile.");
      }
    } catch {
      alert("Impossibile avviare il pagamento per lo sblocco contatti.");
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <section className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
        &larr; Torna alle richieste
      </Link>

      {/* === HEADER === */}
      <div className="card space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Dettaglio richiesta</p>
          <h1 className="text-3xl font-semibold text-[#0f172a]">{title}</h1>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[#0f172a]">{statusLabel}</span>
            {isAdr && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">ADR</span>
            )}
            {completed && (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-emerald-200">
                Completato
              </span>
            )}
            {acceptedAtDate && (
              <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[#0f172a]">
                Accettato il {acceptedAtDate.toLocaleDateString("it-IT")}
              </span>
            )}
          </div>

          <p className="text-sm text-[#475569]">{statusCopy}</p>
          {acceptMessage && <p className="text-sm text-[#0f172a]">{acceptMessage}</p>}

          {role === "COMPANY" && isAccepted && !completed && (
            <button type="button" onClick={handleMarkCompleted} className="btn-secondary text-xs">
              Segna come completato
            </button>
          )}
          {role === "TRANSPORTER" && assignedToOther && (
            <p className="text-sm text-[#0f172a]">Trasporto gi&agrave; accettato.</p>
          )}
          {role === "TRANSPORTER" && assignedToSelf && (
            <p className="text-sm text-[#0f172a]">Sei il trasportatore assegnato.</p>
          )}
        </div>

        {/* === RIEPILOGO GRIGLIA === */}
        <div className="grid gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">Valore trasporto</p>
            <p className="text-lg font-semibold text-[#0f172a]">{formatCurrency(priceCents)}</p>
          </div>
          <InfoCell label="Data ritiro" value={fmtDate(pickupDate)} />
          <InfoCell label="Data consegna" value={fmtDate(deliveryDate)} />
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">ID richiesta</p>
            <p className="text-sm font-medium text-[#0f172a]">#{requestId}</p>
          </div>
        </div>
      </div>

      {/* === DETTAGLI CARICO === */}
      <div className="card space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0b3c5d]">Dettagli carico</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <InfoCell label="Tipo merce" value={cargoType ? (CARGO_LABELS[cargoType] || cargoType) : null} />
          <InfoCell label="Mezzo richiesto" value={vehicleType ? (VEHICLE_LABELS[vehicleType] || vehicleType) : null} />
          <InfoCell label="Peso stimato" value={weight ? `${weight.toLocaleString("it-IT")} kg` : null} />
          <InfoCell label="Volume / Dimensioni" value={volume} />
          <InfoCell label="N. colli / pallet" value={palletCount ? String(palletCount) : null} />
          <InfoCell label="Distanza" value={distanceKm ? `${distanceKm.toLocaleString("it-IT")} km` : null} />
        </div>
        {cargo && (
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">Note carico</p>
            <p className="text-sm text-[#475569]">{cargo}</p>
          </div>
        )}
        {description && (
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">Descrizione / istruzioni</p>
            <p className="text-sm leading-relaxed text-[#475569]">{description}</p>
          </div>
        )}
      </div>

      {/* === ECONOMIA E PAGAMENTO === */}
      <div className="card space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0b3c5d]">Budget e pagamento</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">Prezzo trasporto</p>
            <p className="text-lg font-semibold text-[#0f172a]">{formatCurrency(priceCents)}</p>
          </div>
          <InfoCell label="Modalit&agrave; pagamento" value={paymentTerms ? (PAYMENT_LABELS[paymentTerms] || paymentTerms) : null} />
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748b]">Pubblicata il</p>
            <p className="text-sm font-medium text-[#0f172a]">{new Date(createdAt).toLocaleDateString("it-IT")}</p>
          </div>
        </div>
      </div>

      {/* === REFERENTE RITIRO === */}
      {(pickupContact || pickupPhone || companyName) && (
        <div className="card space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0b3c5d]">Referente ritiro</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <InfoCell label="Azienda" value={companyName} />
            <InfoCell label="Nome referente" value={pickupContact} />
            <InfoCell label="Telefono referente" value={pickupPhone} />
          </div>
        </div>
      )}

      {/* === CONTATTI (SBLOCCO) === */}
      {role === "COMPANY" && contactsVisible && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
          <p className="font-semibold">Trasporto accettato</p>
          <p className="text-sm text-[#475569]">
            Email trasportatore: {contactEmail ?? "Non disponibile"}
          </p>
          <p className="text-sm text-[#475569]">
            Telefono trasportatore: {contactPhone ?? "Non disponibile"}
          </p>
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#0f172a]">Contatti</h2>
            <p className="text-sm text-[#475569]">
              {contactsVisible
                ? "Contatti disponibili per questa richiesta."
                : "I contatti saranno visibili solo dopo il pagamento di entrambe le parti."}
            </p>
          </div>
        </div>

        {contactsVisible ? (
          <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
            <p className="font-semibold">{contactHeadline}</p>
            <p className="text-sm text-[#475569]">{contactEmail ?? "Email non disponibile"}</p>
            <p className="text-sm text-[#475569]">{contactPhone ?? "Telefono non disponibile"}</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              Contatti sbloccati
            </span>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-dashed border-[#f5c76a]/80 bg-[#fff8ed] p-4 text-sm text-[#475569]">
            <div className="text-sm text-[#0f172a]">
              Contatti disponibili dopo il pagamento della commissione (2% + IVA)
            </div>
            {shouldShowCta && (
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 text-sm text-[#0f172a] shadow-sm">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Sblocca contatti</p>
                  <p className="text-sm text-[#475569]">Commissione di servizio applicata solo a trasporto concluso.</p>
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
                  {unlocking ? "Pagamento..." : "Sblocca contatti (2% + IVA)"}
                </button>
              </div>
            )}
            {hasPaid && !contactsVisible && (
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                  Pagamento completato
                </span>
                <p className="text-xs text-[#475569]">In attesa del pagamento dell&apos;altra parte</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
