"use client";

import Link from "next/link";
import { useState } from "react";

import { ActionButton } from "@/components/loads/action-button";
import { ChatThread } from "@/components/loads/chat-thread";
import { CARGO_LABELS, PAYMENT_LABELS, VEHICLE_LABELS } from "@/lib/catalog";
import { euroPerKm, formatDate, formatEuro, timeAgo } from "@/lib/format";
import { APPLICATION_STATUS_LABELS, CONFIRM_WINDOW_HOURS, REQUEST_STATUS_LABELS } from "@/lib/request-flow";

export type CandidateSummary = {
  applicationId: number;
  status: string;
  name: string;
  place: string | null;
  vehicleTypes: string[];
  serviceRegions: string[];
  vatVerified: boolean;
  memberSince: string;
  delivered: number;
  rating: number | null;
  reviews: number;
  priceCents: number;
  proposedDifferentPrice: boolean;
  message: string | null;
  selectedAt: string | null;
  unread: number;
  isChosen: boolean;
  commissionCents: number;
  contacts: { email: string; phone: string | null } | null;
};

export type LoadDetailData = {
  id: number;
  role: "COMPANY" | "TRANSPORTER" | "ADMIN";
  backHref: string;
  status: string;
  pickup: string;
  delivery: string;
  pickupRegion: string | null;
  deliveryRegion: string | null;
  pickupDate: string | null;
  deliveryDate: string | null;
  priceCents: number;
  agreedPriceCents: number | null;
  distanceKm: number | null;
  cargo: string | null;
  cargoType: string | null;
  description: string | null;
  vehicleType: string | null;
  weight: number | null;
  volume: string | null;
  palletCount: number | null;
  isAdr: boolean;
  paymentTerms: string | null;
  createdAt: string;
  assignedAt: string | null;
  company: {
    name: string;
    place: string | null;
    vatVerified: boolean;
    memberSince: string;
    contacts: {
      email: string;
      phone: string | null;
      pickupContact: string | null;
      pickupPhone: string | null;
      pickupAddress: string | null;
      deliveryAddress: string | null;
    } | null;
  };
  ownerDetails: {
    pickupAddress: string | null;
    deliveryAddress: string | null;
    pickupContact: string | null;
    pickupPhone: string | null;
  } | null;
  canApply: boolean;
  companyPaid: boolean;
  candidates: CandidateSummary[];
  myApplication: {
    id: number;
    status: string;
    priceCents: number | null;
    message: string | null;
    selectedAt: string | null;
    unread: number;
  } | null;
  iAmAssigned: boolean;
  myCommissionCents: number;
  /** Il primo sblocco di questa partita IVA e' ancora gratuito. */
  freeUnlock: boolean;
  reviewedByMe: number | null;
};

const STATUS_STYLE: Record<string, string> = {
  OPEN: "badge-urgent",
  ASSIGNED: "badge border-warning/40 bg-warning/10 text-warning",
  CONFIRMED: "badge-verified",
  DELIVERED: "badge-verified",
  CANCELLED: "badge text-neutral-500",
};

function Info({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="table-meta">{label}</p>
      <p className={`text-sm font-medium text-textStrong ${mono ? "stat-mono" : ""}`}>{value}</p>
    </div>
  );
}

function memberSince(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

export function LoadDetail({ data }: { data: LoadDetailData }) {
  const perKm = euroPerKm(data.agreedPriceCents ?? data.priceCents, data.distanceKm);

  return (
    <section className="space-y-5">
      <Link href={data.backHref} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-textStrong">
        &larr; Indietro
      </Link>

      {/* Intestazione: percorso, stato, prezzo */}
      <div className="card animate-fadeUp space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={STATUS_STYLE[data.status] ?? "badge"}>{REQUEST_STATUS_LABELS[data.status] ?? data.status}</span>
          {data.isAdr && <span className="badge border-danger/30 bg-danger/10 text-danger">ADR</span>}
          <span className="table-meta stat-mono">#{data.id} · pubblicato {timeAgo(data.createdAt)}</span>
        </div>
        <h1 className="text-2xl leading-tight sm:text-3xl">
          {data.pickup} <span className="text-accent-500">→</span> {data.delivery}
        </h1>
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-4">
          <div>
            <p className="table-meta">{data.agreedPriceCents ? "Prezzo concordato" : "Prezzo offerto"}</p>
            <p className="stat-mono text-xl font-bold text-textStrong">
              {formatEuro(data.agreedPriceCents ?? data.priceCents, { round: true })}
            </p>
            {perKm && <p className="stat-mono text-xs text-neutral-500">{perKm} €/km</p>}
          </div>
          <Info label="Ritiro" value={formatDate(data.pickupDate, "long")} mono />
          <Info label="Consegna" value={formatDate(data.deliveryDate, "long")} mono />
          <Info label="Distanza stimata" value={data.distanceKm ? `${data.distanceKm.toLocaleString("it-IT")} km` : null} mono />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Dettagli del carico e azienda */}
        <div className="space-y-5">
          <div className="card space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Carico</h2>
            <div className="grid grid-cols-2 gap-4">
              <Info label="Mezzo richiesto" value={data.vehicleType ? VEHICLE_LABELS[data.vehicleType] ?? data.vehicleType : null} />
              <Info label="Tipo merce" value={data.cargoType ? CARGO_LABELS[data.cargoType] ?? data.cargoType : null} />
              <Info label="Peso" value={data.weight ? `${data.weight.toLocaleString("it-IT")} kg` : null} mono />
              <Info label="Pallet / colli" value={data.palletCount ? String(data.palletCount) : null} mono />
              <Info label="Volume / misure" value={data.volume} />
              <Info label="Pagamento" value={data.paymentTerms ? PAYMENT_LABELS[data.paymentTerms] ?? data.paymentTerms : null} />
            </div>
            {data.cargo && data.cargo !== data.cargoType && <Info label="Note carico" value={data.cargo} />}
            {data.ownerDetails &&
              (data.ownerDetails.pickupAddress ||
                data.ownerDetails.deliveryAddress ||
                data.ownerDetails.pickupContact ||
                data.ownerDetails.pickupPhone) && (
                <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
                  <p className="table-meta">Visibili al trasportatore solo dopo la conferma</p>
                  {data.ownerDetails.pickupAddress && <p>Ritiro: {data.ownerDetails.pickupAddress}</p>}
                  {data.ownerDetails.deliveryAddress && <p>Consegna: {data.ownerDetails.deliveryAddress}</p>}
                  {(data.ownerDetails.pickupContact || data.ownerDetails.pickupPhone) && (
                    <p>
                      Referente: {data.ownerDetails.pickupContact ?? ""} {data.ownerDetails.pickupPhone ?? ""}
                    </p>
                  )}
                </div>
              )}
            {data.description && (
              <div>
                <p className="table-meta">Istruzioni</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">{data.description}</p>
              </div>
            )}
          </div>

          {data.role !== "COMPANY" && (
            <div className="card space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Azienda</h2>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-textStrong">{data.company.name}</p>
                {data.company.vatVerified && <span className="badge-verified">P.IVA verificata</span>}
              </div>
              <p className="text-sm text-neutral-600">
                {data.company.place ? `${data.company.place} · ` : ""}su DodiX da {memberSince(data.company.memberSince)}
              </p>
              {data.company.contacts ? (
                <div className="space-y-1 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-textStrong">
                  <p className="font-semibold">Contatti</p>
                  {data.company.contacts.phone && (
                    <a className="block font-semibold underline" href={`tel:${data.company.contacts.phone}`}>
                      {data.company.contacts.phone}
                    </a>
                  )}
                  <a className="block underline" href={`mailto:${data.company.contacts.email}`}>
                    {data.company.contacts.email}
                  </a>
                  {(data.company.contacts.pickupContact || data.company.contacts.pickupPhone) && (
                    <p className="pt-1 text-neutral-600">
                      Referente al ritiro: {data.company.contacts.pickupContact ?? ""} {data.company.contacts.pickupPhone ?? ""}
                    </p>
                  )}
                  {data.company.contacts.pickupAddress && (
                    <p className="text-neutral-600">Indirizzo di ritiro: {data.company.contacts.pickupAddress}</p>
                  )}
                  {data.company.contacts.deliveryAddress && (
                    <p className="text-neutral-600">Indirizzo di consegna: {data.company.contacts.deliveryAddress}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-500">
                  Telefono ed email dell&apos;azienda compaiono quando l&apos;azienda ti sceglie e confermi.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pannello azioni per ruolo */}
        <div className="space-y-5">
          {data.role === "TRANSPORTER" && <TransporterPanel data={data} />}
          {(data.role === "COMPANY" || data.role === "ADMIN") && <CompanyPanel data={data} />}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Trasportatore ───────────────────────── */

function ApplyForm({ data, editing, onCancel }: { data: LoadDetailData; editing?: boolean; onCancel?: () => void }) {
  const mine = data.myApplication;
  const [mode, setMode] = useState<"accept" | "propose">(mine?.priceCents ? "propose" : "accept");
  const [price, setPrice] = useState(mine?.priceCents ? String(mine.priceCents / 100) : "");
  const [message, setMessage] = useState(mine?.message ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${data.id}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: mode === "propose" ? price : null, message }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Candidatura non inviata.");
      } else {
        onCancel?.();
        window.location.reload();
      }
    } catch {
      setError("Connessione non riuscita.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("accept")}
          className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-sm ${mode === "accept" ? "border-accent-500 bg-accent-50 font-semibold" : "border-neutral-200"}`}
        >
          Accetto {formatEuro(data.priceCents, { round: true })}
        </button>
        <button
          type="button"
          onClick={() => setMode("propose")}
          className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-sm ${mode === "propose" ? "border-accent-500 bg-accent-50 font-semibold" : "border-neutral-200"}`}
        >
          Propongo un altro prezzo
        </button>
      </div>
      {mode === "propose" && (
        <label className="form-field">
          <span className="label">Il tuo prezzo (€)</span>
          <input
            className="input-field stat-mono"
            inputMode="decimal"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Es. 950"
          />
        </label>
      )}
      <label className="form-field">
        <span className="label">Messaggio all&apos;azienda (facoltativo)</span>
        <textarea
          className="input-field min-h-[80px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          placeholder="Es. Bilico centinato disponibile, posso caricare dalle 7. Sponda idraulica."
        />
      </label>
      {error && <p className="alert-danger text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary min-h-[44px]" disabled={loading}>
          {loading ? "Invio..." : editing ? "Aggiorna candidatura" : "Candidati gratis"}
        </button>
        {editing && (
          <button type="button" className="btn-ghost min-h-[44px]" onClick={onCancel}>
            Annulla
          </button>
        )}
      </div>
      {!editing && (
        <p className="text-xs text-neutral-500">
          Candidarsi è gratis. Paghi la commissione DodiX (2% + IVA) solo se l&apos;azienda sceglie te e tu confermi.
          {data.freeUnlock && " Il tuo primo sblocco è gratis."}
        </p>
      )}
    </form>
  );
}

function TransporterPanel({ data }: { data: LoadDetailData }) {
  const [editing, setEditing] = useState(false);
  const app = data.myApplication;

  if (!app || app.status === "WITHDRAWN") {
    if (!data.canApply) {
      return (
        <div className="card-muted text-sm text-neutral-600">Questo carico non accetta più candidature.</div>
      );
    }
    return (
      <div className="card space-y-4">
        <div>
          <h2 className="text-lg">Ti interessa questo carico?</h2>
          <p className="text-sm text-neutral-600">Candidati: l&apos;azienda confronta i candidati e sceglie.</p>
        </div>
        <ApplyForm data={data} />
      </div>
    );
  }

  const chat = <ChatThread applicationId={app.id} counterpartName={data.company.name} />;

  if (data.iAmAssigned && data.status === "ASSIGNED") {
    const deadline = app.selectedAt
      ? new Date(new Date(app.selectedAt).getTime() + CONFIRM_WINDOW_HOURS * 3600e3)
      : null;
    return (
      <>
        <div className="card space-y-4 border-2 border-accent-500">
          <span className="badge-urgent w-fit">L&apos;azienda ha scelto te</span>
          <h2 className="text-xl">Conferma il carico e ricevi i contatti</h2>
          <p className="text-sm text-neutral-600">
            Prezzo concordato <b className="stat-mono">{formatEuro(data.agreedPriceCents, { round: true })}</b>.{" "}
            {data.freeUnlock ? (
              <>
                È il tuo primo sblocco: la commissione DodiX di{" "}
                <b className="stat-mono">{formatEuro(data.myCommissionCents)}</b> (2% + IVA) per te è{" "}
                <b>gratis</b>. Confermi e vedi subito telefono ed email.
              </>
            ) : (
              <>
                L&apos;azienda ha già fatto la sua parte: confermando paghi la commissione DodiX di{" "}
                <b className="stat-mono">{formatEuro(data.myCommissionCents)}</b> (2% + IVA) e vedi subito telefono ed email.
              </>
            )}
          </p>
          {deadline && (
            <p className="text-xs text-neutral-500">
              Hai tempo fino a {deadline.toLocaleString("it-IT", { weekday: "short", hour: "2-digit", minute: "2-digit" })}, poi l&apos;azienda
              potrà scegliere un altro trasportatore.
            </p>
          )}
          <ActionButton
            label={data.freeUnlock ? "Conferma gratis" : `Conferma e paga ${formatEuro(data.myCommissionCents)}`}
            url="/api/stripe/unlock"
            body={{ requestId: data.id }}
            className="w-full"
          />
          <ActionButton
            label="Non posso più farlo"
            url={`/api/applications/${app.id}`}
            method="PATCH"
            body={{ action: "decline" }}
            variant="ghost"
            confirm="Rinunci al carico? L'azienda potrà scegliere un altro trasportatore. Non paghi nulla."
            confirmLabel="Sì, rinuncio"
          />
        </div>
        {chat}
      </>
    );
  }

  if (data.iAmAssigned && (data.status === "CONFIRMED" || data.status === "DELIVERED")) {
    return (
      <>
        <div className="card space-y-3">
          <span className="badge-verified w-fit">{data.status === "DELIVERED" ? "Consegnato" : "Carico confermato"}</span>
          <h2 className="text-lg">
            {data.status === "DELIVERED" ? "Trasporto completato" : "Il carico è tuo: accordati con l'azienda"}
          </h2>
          <p className="text-sm text-neutral-600">I contatti dell&apos;azienda sono nella scheda a sinistra.</p>
          {data.status === "CONFIRMED" && (
            <ActionButton
              label="Segna come consegnato"
              url={`/api/requests/${data.id}`}
              method="PATCH"
              body={{ action: "deliver" }}
              variant="secondary"
              confirm="Confermi di aver consegnato il carico?"
            />
          )}
          {data.status === "DELIVERED" && <ReviewBox data={data} targetLabel="l'azienda" />}
        </div>
        {chat}
      </>
    );
  }

  if (app.status === "PENDING") {
    const someoneElseChosen = data.status !== "OPEN";
    return (
      <>
        <div className="card space-y-3">
          <span className="badge w-fit">{someoneElseChosen ? "Scelto un altro, in attesa" : "Candidatura inviata"}</span>
          {someoneElseChosen ? (
            <p className="text-sm text-neutral-600">
              L&apos;azienda ha scelto un altro trasportatore, che deve ancora confermare. Se rinuncia, potresti essere scelto tu.
            </p>
          ) : editing ? (
            <ApplyForm data={data} editing onCancel={() => setEditing(false)} />
          ) : (
            <>
              <p className="text-sm text-neutral-600">
                Hai proposto <b className="stat-mono">{formatEuro(app.priceCents ?? data.priceCents, { round: true })}</b>.
                Ti avvisiamo appena l&apos;azienda decide.
              </p>
              {app.message && <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">“{app.message}”</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-secondary min-h-[44px]" onClick={() => setEditing(true)}>
                  Modifica
                </button>
                <ActionButton
                  label="Ritira candidatura"
                  url={`/api/applications/${app.id}`}
                  method="PATCH"
                  body={{ action: "withdraw" }}
                  variant="ghost"
                  confirm="Vuoi ritirare la candidatura?"
                  confirmLabel="Ritira"
                />
              </div>
            </>
          )}
        </div>
        {chat}
      </>
    );
  }

  return (
    <div className="card-muted space-y-1 text-sm text-neutral-600">
      <p className="font-semibold text-textStrong">{APPLICATION_STATUS_LABELS[app.status] ?? app.status}</p>
      <p>
        {app.status === "REJECTED" && data.status === "CANCELLED"
          ? "L'azienda ha annullato il carico. Non hai pagato nulla."
          : app.status === "REJECTED"
          ? "Il carico è stato assegnato a un altro trasportatore. Non hai pagato nulla."
          : app.status === "RELEASED"
            ? "Non hai confermato entro 24 ore e l'azienda ha scelto un altro trasportatore."
            : "Hai rinunciato a questo carico."}
      </p>
    </div>
  );
}

/* ───────────────────────── Azienda ───────────────────────── */

function CandidateCard({ c, data, open }: { c: CandidateSummary; data: LoadDetailData; open: boolean }) {
  const [chatOpen, setChatOpen] = useState(c.isChosen || c.unread > 0);
  const canChoose = data.role === "COMPANY" && data.status === "OPEN" && c.status === "PENDING";
  const releasable =
    c.isChosen &&
    data.status === "ASSIGNED" &&
    c.selectedAt !== null &&
    Date.now() - new Date(c.selectedAt).getTime() >= CONFIRM_WINDOW_HOURS * 3600e3;

  return (
    <div className={`card space-y-3 ${c.isChosen ? "border-2 border-accent-500" : ""} ${!open && !c.isChosen ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-textStrong">{c.name}</p>
            {c.vatVerified && <span className="badge-verified">P.IVA verificata</span>}
            {c.status !== "PENDING" && !c.isChosen && <span className="badge">{APPLICATION_STATUS_LABELS[c.status]}</span>}
          </div>
          <p className="text-xs text-neutral-500">
            {c.place ? `${c.place} · ` : ""}su DodiX da {memberSince(c.memberSince)}
            {c.delivered > 0 ? ` · ${c.delivered} consegne` : ""}
            {c.rating ? ` · ★ ${c.rating.toFixed(1)} (${c.reviews})` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="stat-mono text-lg font-bold text-textStrong">{formatEuro(c.priceCents, { round: true })}</p>
          <p className="text-[11px] text-neutral-500">{c.proposedDifferentPrice ? "prezzo proposto" : "accetta il tuo prezzo"}</p>
        </div>
      </div>

      {(c.vehicleTypes.length > 0 || c.serviceRegions.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {c.vehicleTypes.map((v) => (
            <span key={v} className="table-chip">{VEHICLE_LABELS[v] ?? v}</span>
          ))}
          {c.serviceRegions.slice(0, 4).map((r) => (
            <span key={r} className="table-chip">{r}</span>
          ))}
          {c.serviceRegions.length > 4 && <span className="table-chip">+{c.serviceRegions.length - 4} regioni</span>}
        </div>
      )}

      {c.message && <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">“{c.message}”</p>}

      {c.contacts && (
        <div className="space-y-1 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-textStrong">
          <p className="font-semibold">Contatti del trasportatore</p>
          {c.contacts.phone && (
            <a className="block font-semibold underline" href={`tel:${c.contacts.phone}`}>
              {c.contacts.phone}
            </a>
          )}
          <a className="block underline" href={`mailto:${c.contacts.email}`}>
            {c.contacts.email}
          </a>
        </div>
      )}

      {c.isChosen && data.status === "ASSIGNED" && (
        <p className="rounded-lg bg-warning/10 p-3 text-sm text-textStrong">
          Hai scelto questo trasportatore. Ora deve confermare pagando la sua parte: appena lo fa vedete entrambi i contatti.
          {c.selectedAt && !releasable && " Se non conferma entro 24 ore potrai scegliere un altro candidato senza pagare di nuovo."}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canChoose && (
          <ActionButton
            label={
              data.companyPaid
                ? "Scegli questo trasportatore"
                : data.freeUnlock
                  ? "Scegli · primo sblocco gratis"
                  : `Scegli · paghi ${formatEuro(c.commissionCents)}`
            }
            url={`/api/applications/${c.applicationId}/select`}
            confirm={
              data.companyPaid
                ? `Assegni il carico a ${c.name}? Hai già pagato la commissione per questo carico.`
                : data.freeUnlock
                  ? `Assegni il carico a ${c.name} a ${formatEuro(c.priceCents, { round: true })}. È il tuo primo sblocco: la commissione DodiX di ${formatEuro(c.commissionCents)} (2% + IVA) per te è gratis. Il trasportatore conferma la sua parte e vi scambiate i contatti.`
                  : `Assegni il carico a ${c.name} a ${formatEuro(c.priceCents, { round: true })}. Paghi ora la commissione DodiX di ${formatEuro(c.commissionCents)} (2% + IVA); il trasportatore conferma pagando la sua parte e vi scambiate i contatti.`
            }
            confirmLabel={data.companyPaid || data.freeUnlock ? "Assegna" : "Vai al pagamento"}
          />
        )}
        {releasable && (
          <ActionButton
            label="Scegli un altro candidato"
            url={`/api/applications/${c.applicationId}`}
            method="PATCH"
            body={{ action: "release" }}
            variant="secondary"
            confirm="Il trasportatore non ha confermato in 24 ore. Riapri il carico per scegliere un altro candidato (senza pagare di nuovo)?"
            confirmLabel="Riapri"
          />
        )}
        {data.role === "COMPANY" && c.status !== "REJECTED" && (
          <button type="button" className="btn-secondary min-h-[44px]" onClick={() => setChatOpen((v) => !v)}>
            {chatOpen ? "Chiudi chat" : c.unread > 0 ? `Chat (${c.unread} nuovi)` : "Scrivi"}
          </button>
        )}
      </div>

      {chatOpen && data.role === "COMPANY" && <ChatThread applicationId={c.applicationId} counterpartName={c.name} />}
    </div>
  );
}

function CompanyPanel({ data }: { data: LoadDetailData }) {
  const open = data.status === "OPEN";
  const chosen = data.candidates.find((c) => c.isChosen) ?? data.candidates.find((c) => c.contacts);
  const others = data.candidates.filter((c) => c !== chosen);

  return (
    <>
      {(data.status === "CONFIRMED" || data.status === "DELIVERED") && (
        <div className="card space-y-3">
          <span className="badge-verified w-fit">{data.status === "DELIVERED" ? "Consegnato" : "Confermato da entrambi"}</span>
          <p className="text-sm text-neutral-600">
            {data.status === "DELIVERED"
              ? "Trasporto completato."
              : "Il trasportatore ha confermato: trovi telefono ed email qui sotto."}
          </p>
          {data.status === "CONFIRMED" && data.role === "COMPANY" && (
            <ActionButton
              label="Segna come consegnato"
              url={`/api/requests/${data.id}`}
              method="PATCH"
              body={{ action: "deliver" }}
              variant="secondary"
              confirm="Confermi che il carico è stato consegnato?"
            />
          )}
          {data.status === "DELIVERED" && data.role === "COMPANY" && <ReviewBox data={data} targetLabel="il trasportatore" />}
        </div>
      )}

      {chosen && <CandidateCard c={chosen} data={data} open={open} />}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">
            Candidati <span className="stat-mono text-neutral-500">({data.candidates.length})</span>
          </h2>
          {open && data.role === "COMPANY" && (
            <ActionButton
              label="Annulla carico"
              url={`/api/requests/${data.id}`}
              method="PATCH"
              body={{ action: "cancel" }}
              variant="ghost"
              confirm={
                data.companyPaid
                  ? "Annulli il carico? I candidati verranno avvisati. La commissione che hai già pagato per questo carico non viene rimborsata."
                  : "Annulli il carico? I candidati verranno avvisati che non è più disponibile."
              }
              confirmLabel="Sì, annulla"
            />
          )}
        </div>

        {data.candidates.length === 0 ? (
          <div className="card-muted space-y-1 text-sm text-neutral-600">
            <p className="font-semibold text-textStrong">Nessuna candidatura per ora</p>
            <p>
              Il carico è stato inviato su WhatsApp ai trasportatori iscritti. Ti avvisiamo via email a ogni nuova candidatura.
            </p>
          </div>
        ) : (
          others.map((c) => <CandidateCard key={c.applicationId} c={c} data={data} open={open} />)
        )}
      </div>
    </>
  );
}

/* ───────────────────────── Recensione ───────────────────────── */

function ReviewBox({ data, targetLabel }: { data: LoadDetailData; targetLabel: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (data.reviewedByMe) {
    return <p className="text-sm text-neutral-600">Hai lasciato {"★".repeat(data.reviewedByMe)} a {targetLabel}. Grazie!</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Scegli da 1 a 5 stelle.");
    setLoading(true);
    const res = await fetch(`/api/requests/${data.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!res.ok) return setError(body.error ?? "Recensione non salvata.");
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl border border-neutral-200 p-3">
      <p className="text-sm font-semibold text-textStrong">Com&apos;è andata con {targetLabel}?</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Valutazione">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} stelle`}
            onClick={() => setRating(n)}
            className={`h-11 w-11 rounded-lg text-2xl ${n <= rating ? "text-accent-500" : "text-neutral-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <input
        className="input-field"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        placeholder="Un commento (facoltativo)"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <button type="submit" className="btn-secondary min-h-[44px]" disabled={loading}>
        Invia recensione
      </button>
    </form>
  );
}
