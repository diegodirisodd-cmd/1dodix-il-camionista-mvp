"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

import { ScrollReveal } from "@/components/scroll-reveal";
import { SkeletonCard } from "@/components/skeleton";
import { type Role } from "@/lib/roles";
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_STATUS_VALUES,
  formatCents,
  type ServiceRequestStatus,
} from "@/lib/service-categories";

import { StatusBadge, UrgencyBadge } from "./service-badges";
import { type ServiceRequestItem } from "./types";

type ServicesBoardProps = {
  role: Role;
};

const OPEN_STATES: ServiceRequestStatus[] = ["APERTA", "IN_TRATTATIVA", "ASSEGNATA"];

export function ServicesBoard({ role }: ServicesBoardProps) {
  const [items, setItems] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | "TUTTE">("TUTTE");

  const isTransporter = role === "TRANSPORTER";

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        const response = await fetch("/api/service-requests");

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Impossibile caricare le richieste");
        }

        const data = (await response.json()) as ServiceRequestItem[];
        if (!isMounted) return;
        setItems(data);
        setLoadError(null);
      } catch (error) {
        if (!isMounted) return;
        console.error("[ServicesBoard] load failed", error);
        setLoadError(error instanceof Error ? error.message : "Impossibile caricare le richieste");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    if (statusFilter === "TUTTE") return items;
    return items.filter((item) => item.stato === statusFilter);
  }, [items, statusFilter]);

  const counters = useMemo(() => {
    const open = items.filter((item) => OPEN_STATES.includes(item.stato)).length;
    const quotes = items.reduce((total, item) => total + (item.quotes?.length ?? 0), 0);
    return { total: items.length, open, quotes };
  }, [items]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label={isTransporter ? "Richieste pubblicate" : "Richieste compatibili"} value={counters.total} />
        <StatTile label="In corso" value={counters.open} />
        <StatTile
          label={isTransporter ? "Preventivi ricevuti" : "Preventivi inviati"}
          value={counters.quotes}
        />
      </div>

      {loadError && <p className="alert-danger">{loadError}</p>}

      {isTransporter && (
        <div className="flex flex-wrap gap-2">
          <FilterChip active={statusFilter === "TUTTE"} onClick={() => setStatusFilter("TUTTE")}>
            Tutte
          </FilterChip>
          {SERVICE_REQUEST_STATUS_VALUES.map((stato) => (
            <FilterChip
              key={stato}
              active={statusFilter === stato}
              onClick={() => setStatusFilter(stato)}
            >
              {SERVICE_REQUEST_STATUS_LABELS[stato]}
            </FilterChip>
          ))}
        </div>
      )}

      {visibleItems.length === 0 ? (
        <EmptyState role={role} filtered={statusFilter !== "TUTTE"} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleItems.map((item, index) => (
            <ScrollReveal key={item.id} className="h-full" delayMs={Math.min(index, 5) * 60}>
              <ServiceRequestCard item={item} isTransporter={isTransporter} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceRequestCard({
  item,
  isTransporter,
}: {
  item: ServiceRequestItem;
  isTransporter: boolean;
}) {
  const quotes = item.quotes ?? [];
  const bestQuote = quotes.reduce<number | null>(
    (min, quote) => (min === null || quote.priceCents < min ? quote.priceCents : min),
    null,
  );

  return (
    <Link
      href={`/dashboard/services/${item.id}`}
      className="card card-hover flex h-full flex-col gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-600">
            {SERVICE_CATEGORY_LABELS[item.categoria] ?? item.categoria}
          </p>
          <h3 className="text-base">
            {item.marcaVeicolo} · {item.tipoVeicolo}
          </h3>
        </div>
        <span className="stat-mono text-xs text-neutral-500">#{item.id}</span>
      </div>

      <p className="line-clamp-3 text-sm text-neutral-600">{item.descrizione}</p>

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-0.5">
          <dt className="table-meta">Posizione</dt>
          <dd className="text-neutral-700">
            {item.posizione} <span className="stat-mono font-semibold">({item.provincia})</span>
          </dd>
        </div>
        <div className="space-y-0.5">
          <dt className="table-meta">Entro il</dt>
          <dd className="stat-mono text-neutral-700">
            {new Date(item.scadenza).toLocaleDateString("it-IT")}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge stato={item.stato} />
          <UrgencyBadge urgenza={item.urgenza} />
        </div>
        <p className="text-xs text-neutral-500">
          {isTransporter ? (
            quotes.length > 0 ? (
              <>
                <span className="stat-mono font-semibold text-textStrong">{quotes.length}</span> preventivi · da{" "}
                <span className="stat-mono font-semibold text-textStrong">
                  {bestQuote !== null ? formatCents(bestQuote) : "—"}
                </span>
              </>
            ) : (
              "Nessun preventivo ancora"
            )
          ) : quotes.length > 0 ? (
            <>
              Preventivo inviato:{" "}
              <span className="stat-mono font-semibold text-textStrong">
                {formatCents(quotes[0].priceCents)}
              </span>
            </>
          ) : (
            "Nessun preventivo inviato"
          )}
        </p>
      </div>
    </Link>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="card space-y-1 p-4">
      <p className="table-meta">{label}</p>
      <p className="stat-mono text-3xl font-bold text-textStrong">{value}</p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "min-h-[44px] rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-150",
        active
          ? "border-accent-500 bg-accent-500 text-white shadow-glow"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-accent-300 hover:text-accent-700",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ role, filtered }: { role: Role; filtered: boolean }) {
  if (filtered) {
    return <div className="card-muted text-sm text-neutral-600">Nessuna richiesta con questo stato.</div>;
  }

  if (role === "TRANSPORTER") {
    return (
      <div className="card-muted space-y-3">
        <h3>Nessuna richiesta pubblicata</h3>
        <p>
          Pubblica la prima richiesta: officine, telonai, gommisti e soccorso stradale della tua zona
          ricevono una notifica e ti mandano un preventivo.
        </p>
        <Link href="/dashboard/services/new" className="btn-primary">
          Cerco un servizio
        </Link>
      </div>
    );
  }

  return (
    <div className="card-muted space-y-3">
      <h3>Nessuna richiesta compatibile</h3>
      <p>
        Le richieste ti vengono mostrate in base alle categorie e alle province che copri. Se non vedi
        nulla, controlla le zone servite nel tuo profilo.
      </p>
      <Link href="/dashboard/supplier/profile" className="btn-secondary">
        Gestisci zone servite
      </Link>
    </div>
  );
}
