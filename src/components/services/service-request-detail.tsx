"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ScrollReveal } from "@/components/scroll-reveal";
import { Skeleton, SkeletonCard } from "@/components/skeleton";
import { type Role } from "@/lib/roles";
import {
  SERVICE_CATEGORY_LABELS,
  formatCents,
  getServiceUnlockTotalCents,
} from "@/lib/service-categories";

import { StatusBadge, UrgencyBadge } from "./service-badges";
import { type ServiceQuoteItem, type ServiceRequestItem } from "./types";

type DetailResponse = ServiceRequestItem & {
  contactUnlockedByMe?: boolean;
  viewerSupplierProfileId?: number | null;
};

type ServiceRequestDetailProps = {
  requestId: number;
  role: Role;
  userId: number;
};

export function ServiceRequestDetail({ requestId, role, userId }: ServiceRequestDetailProps) {
  const searchParams = useSearchParams();
  const [item, setItem] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const unlockOutcome = searchParams.get("unlock");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/service-requests/${requestId}`);
      const data = (await response.json()) as DetailResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data?.error ?? "Impossibile caricare la richiesta");
      }

      setItem(data);
      setError(null);
    } catch (loadError) {
      console.error("[ServiceRequestDetail] load failed", loadError);
      setError(loadError instanceof Error ? loadError.message : "Impossibile caricare la richiesta");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (key: string, request: () => Promise<Response>) => {
    setActionError(null);
    setPendingAction(key);

    try {
      const response = await request();
      const data = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

      if (!response.ok) {
        setActionError(data?.error ?? "Operazione non riuscita.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      await load();
    } catch (requestError) {
      console.error("[ServiceRequestDetail] action failed", requestError);
      setActionError("Operazione non riuscita. Riprova.");
    } finally {
      setPendingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-4">
        <p className="alert-danger">{error ?? "Richiesta non trovata"}</p>
        <Link href="/dashboard/services" className="btn-secondary">
          Torna alla bacheca
        </Link>
      </div>
    );
  }

  const isOwner = role === "TRANSPORTER" && item.transporterId === userId;
  const isSupplier = role === "SUPPLIER";
  const isClosed = item.stato === "CONCLUSA" || item.stato === "ANNULLATA";
  const myQuote = isSupplier
    ? item.quotes.find((quote) => quote.supplierId === item.viewerSupplierProfileId) ?? null
    : null;
  const contactUnlocked = Boolean(item.contactUnlockedByMe) || Boolean(item.transporter?.phone || item.transporter?.email);

  return (
    <div className="space-y-6">
      {unlockOutcome === "success" && (
        <p className="alert-success">
          Pagamento completato. Il contatto del trasportatore compare qui sotto appena Stripe conferma
          l&apos;operazione (di norma pochi secondi).
        </p>
      )}
      {unlockOutcome === "cancelled" && (
        <p className="alert-warning">Pagamento annullato: il contatto resta bloccato.</p>
      )}
      {actionError && <p className="alert-danger">{actionError}</p>}

      <div className="card animate-fadeUp space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              {SERVICE_CATEGORY_LABELS[item.categoria] ?? item.categoria}
            </p>
            <h1>
              {item.marcaVeicolo} · {item.tipoVeicolo}
            </h1>
            <p className="stat-mono text-xs text-neutral-500">
              Richiesta #{item.id} · pubblicata il {new Date(item.createdAt).toLocaleDateString("it-IT")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge stato={item.stato} />
            <UrgencyBadge urgenza={item.urgenza} />
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-3">
          <Field label="Posizione del mezzo">
            {item.posizione} <span className="stat-mono font-semibold">({item.provincia})</span>
          </Field>
          <Field label="Intervento entro il">
            <span className="stat-mono">{new Date(item.scadenza).toLocaleDateString("it-IT")}</span>
          </Field>
          <Field label="Preventivi ricevuti">
            <span className="stat-mono">{item.quotes.length}</span>
          </Field>
        </dl>

        <div className="space-y-2">
          <p className="table-meta">Descrizione del problema</p>
          <p className="whitespace-pre-line text-sm text-neutral-700">{item.descrizione}</p>
        </div>

        {item.fotos.length > 0 && (
          <div className="space-y-2">
            <p className="table-meta">Fotografie</p>
            <div className="flex flex-wrap gap-3">
              {item.fotos.map((foto) => (
                <a
                  key={foto.id}
                  href={foto.url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative h-28 w-28 overflow-hidden rounded-xl border border-neutral-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-cardHover"
                >
                  <Image
                    src={foto.url}
                    alt="Foto della richiesta di servizio"
                    fill
                    sizes="112px"
                    unoptimized
                    className="object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {isSupplier && (
        <SupplierPanel
          item={item}
          myQuote={myQuote}
          contactUnlocked={contactUnlocked}
          isClosed={isClosed}
          pendingAction={pendingAction}
          onSendQuote={(payload) =>
            runAction("quote", () =>
              fetch(`/api/service-requests/${item.id}/quotes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }),
            )
          }
          onUnlock={() =>
            runAction("unlock", () =>
              fetch("/api/stripe/service-unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId: item.id }),
              }),
            )
          }
        />
      )}

      {isOwner && (
        <OwnerPanel
          item={item}
          isClosed={isClosed}
          pendingAction={pendingAction}
          onAssign={(quoteId) =>
            runAction(`assign-${quoteId}`, () =>
              fetch(`/api/service-requests/${item.id}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quoteId }),
              }),
            )
          }
          onChangeStatus={(stato) =>
            runAction(`status-${stato}`, () =>
              fetch(`/api/service-requests/${item.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stato }),
              }),
            )
          }
        />
      )}

      <div>
        <Link href="/dashboard/services" className="btn-ghost">
          ← Torna alla bacheca
        </Link>
      </div>
    </div>
  );
}

function OwnerPanel({
  item,
  isClosed,
  pendingAction,
  onAssign,
  onChangeStatus,
}: {
  item: ServiceRequestItem;
  isClosed: boolean;
  pendingAction: string | null;
  onAssign: (quoteId: number) => void;
  onChangeStatus: (stato: "CONCLUSA" | "ANNULLATA") => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2>Preventivi ricevuti</h2>
          <p>Confronta prezzo, tempi e disponibilità, poi assegna l&apos;intervento.</p>
        </div>
        {!isClosed && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              onClick={() => onChangeStatus("CONCLUSA")}
              disabled={pendingAction !== null || !item.assignedQuoteId}
              title={item.assignedQuoteId ? undefined : "Assegna prima un preventivo"}
            >
              {pendingAction === "status-CONCLUSA" ? "Salvataggio..." : "Segna come conclusa"}
            </button>
            <button
              type="button"
              className="btn-ghost min-h-[44px] text-danger hover:bg-danger/10"
              onClick={() => onChangeStatus("ANNULLATA")}
              disabled={pendingAction !== null}
            >
              {pendingAction === "status-ANNULLATA" ? "Salvataggio..." : "Annulla richiesta"}
            </button>
          </div>
        )}
      </div>

      {item.quotes.length === 0 ? (
        <div className="card-muted text-sm text-neutral-600">
          Ancora nessun preventivo. I fornitori compatibili sono stati avvisati via email.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {item.quotes.map((quote, index) => (
            <ScrollReveal key={quote.id} className="h-full" delayMs={Math.min(index, 5) * 60}>
              <QuoteCard
                quote={quote}
                assigned={quote.id === item.assignedQuoteId}
                canAssign={!isClosed && !item.assignedQuoteId}
                pending={pendingAction === `assign-${quote.id}`}
                disabled={pendingAction !== null}
                onAssign={() => onAssign(quote.id)}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

function QuoteCard({
  quote,
  assigned,
  canAssign,
  pending,
  disabled,
  onAssign,
}: {
  quote: ServiceQuoteItem;
  assigned: boolean;
  canAssign: boolean;
  pending: boolean;
  disabled: boolean;
  onAssign: () => void;
}) {
  const contact = quote.supplier?.user;

  return (
    <div
      className={`card card-hover flex h-full flex-col gap-4 ${
        assigned ? "border-success/40 ring-1 ring-success/30" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base">{quote.supplier?.ragioneSociale ?? "Fornitore"}</h3>
          <p className="text-xs text-neutral-500">
            Inviato il <span className="stat-mono">{new Date(quote.createdAt).toLocaleDateString("it-IT")}</span>
          </p>
        </div>
        <p className="stat-mono text-2xl font-bold text-textStrong">{formatCents(quote.priceCents)}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <Field label="Tempi di intervento" compact>
          {quote.tempi}
        </Field>
        <Field label="Disponibilità" compact>
          {quote.disponibilita}
        </Field>
      </dl>

      {assigned && contact && (contact.email || contact.phone) && (
        <div className="rounded-xl border border-success/30 bg-success/5 px-3 py-2 text-xs text-neutral-700">
          <p className="font-semibold text-success">Contatto del fornitore</p>
          {contact.email && <p className="mt-1">{contact.email}</p>}
          {contact.phone && <p className="stat-mono">{contact.phone}</p>}
        </div>
      )}

      <div className="mt-auto">
        {assigned ? (
          <span className="badge-verified">Preventivo assegnato</span>
        ) : canAssign ? (
          <button
            type="button"
            className="btn-primary min-h-[44px] w-full"
            onClick={onAssign}
            disabled={disabled}
          >
            {pending ? "Assegnazione..." : "Assegna a questo fornitore"}
          </button>
        ) : (
          <span className="badge">Non selezionato</span>
        )}
      </div>
    </div>
  );
}

function SupplierPanel({
  item,
  myQuote,
  contactUnlocked,
  isClosed,
  pendingAction,
  onSendQuote,
  onUnlock,
}: {
  item: ServiceRequestItem;
  myQuote: ServiceQuoteItem | null;
  contactUnlocked: boolean;
  isClosed: boolean;
  pendingAction: string | null;
  onSendQuote: (payload: { price: string; tempi: string; disponibilita: string }) => void;
  onUnlock: () => void;
}) {
  const assignedToMe = myQuote !== null && myQuote.id === item.assignedQuoteId;
  const acceptsQuotes = item.stato === "APERTA" || item.stato === "IN_TRATTATIVA";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card space-y-5">
        <div className="space-y-1">
          <h2>{myQuote ? "Il tuo preventivo" : "Invia un preventivo"}</h2>
          <p>
            {myQuote
              ? "Puoi aggiornarlo finché il trasportatore non assegna l'intervento."
              : "Prezzo, tempi e disponibilità: il trasportatore confronta le offerte e sceglie."}
          </p>
        </div>

        {assignedToMe && <p className="alert-success">Il tuo preventivo è stato accettato.</p>}

        {acceptsQuotes ? (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              onSendQuote({
                price: String(formData.get("price") ?? ""),
                tempi: String(formData.get("tempi") ?? ""),
                disponibilita: String(formData.get("disponibilita") ?? ""),
              });
            }}
          >
            <div className="form-field">
              <label className="label" htmlFor="price">
                Prezzo (€, IVA esclusa) *
              </label>
              <input
                className="input-field stat-mono"
                id="price"
                name="price"
                type="number"
                min="1"
                step="0.01"
                required
                defaultValue={myQuote ? (myQuote.priceCents / 100).toFixed(2) : ""}
              />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="tempi">
                Tempi di intervento *
              </label>
              <input
                className="input-field"
                id="tempi"
                name="tempi"
                type="text"
                required
                placeholder="Entro 4 ore / in giornata / 2 giorni lavorativi"
                defaultValue={myQuote?.tempi ?? ""}
              />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="disponibilita">
                Disponibilità *
              </label>
              <input
                className="input-field"
                id="disponibilita"
                name="disponibilita"
                type="text"
                required
                placeholder="Officina mobile, intervento sul posto / lun-ven 7-19"
                defaultValue={myQuote?.disponibilita ?? ""}
              />
            </div>

            <button type="submit" className="btn-primary min-h-[44px] w-full" disabled={pendingAction !== null}>
              {pendingAction === "quote"
                ? "Invio in corso..."
                : myQuote
                  ? "Aggiorna preventivo"
                  : "Invia preventivo"}
            </button>
          </form>
        ) : (
          <p className="alert-warning">
            {isClosed ? "Questa richiesta è chiusa." : "Questa richiesta non accetta più preventivi."}
          </p>
        )}
      </div>

      <div className="card space-y-4">
        <div className="space-y-1">
          <h2>Contatto del trasportatore</h2>
          <p>
            Il preventivo è gratuito. Paghi solo se vuoi contattare direttamente il trasportatore fuori
            dalla piattaforma.
          </p>
        </div>

        {contactUnlocked && item.transporter && (item.transporter.email || item.transporter.phone) ? (
          <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-neutral-700">
            <p className="font-semibold text-success">Contatto sbloccato</p>
            {item.transporter.companyName && <p className="mt-1 font-semibold">{item.transporter.companyName}</p>}
            {item.transporter.email && <p>{item.transporter.email}</p>}
            {item.transporter.phone && <p className="stat-mono">{item.transporter.phone}</p>}
          </div>
        ) : (
          <>
            <div className="card-muted space-y-2 p-4">
              <p className="text-sm font-semibold text-textStrong">
                {item.transporter?.companyName ?? "Azienda di trasporto"}
              </p>
              <p className="stat-mono text-sm tracking-widest text-neutral-400">••• ••• ••••</p>
              <p className="text-xs text-neutral-500">
                {item.transporter?.city ?? item.posizione} ({item.provincia})
              </p>
            </div>
            <button
              type="button"
              className="btn-primary min-h-[44px] w-full"
              onClick={onUnlock}
              disabled={pendingAction !== null || isClosed}
            >
              {pendingAction === "unlock"
                ? "Apertura pagamento..."
                : `Sblocca contatto · ${formatCents(getServiceUnlockTotalCents())}`}
            </button>
            <p className="text-xs text-neutral-500">
              Importo una tantum per questa richiesta, IVA inclusa. Pagamento gestito da Stripe.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  compact,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="space-y-1">
      <dt className="table-meta">{label}</dt>
      <dd className={compact ? "text-xs text-neutral-700" : "text-sm text-neutral-700"}>{children}</dd>
    </div>
  );
}
