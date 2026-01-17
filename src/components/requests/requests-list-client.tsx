"use client";

import { useEffect, useState } from "react";

import { CompanyRequestsTable } from "@/components/dashboard/company-requests-table";
import { TransporterJobsTable } from "@/components/dashboard/transporter/jobs-table";
import { type Role } from "@/lib/roles";

type RequestApiItem = {
  id: number;
  pickup: string;
  delivery: string;
  price: number;
  createdAt: string;
  transporterId: number | null;
};

type RequestsListClientProps = {
  role: Role;
  basePath: string;
  variant: "company" | "transporter";
  emptyMessage?: string;
};

export function RequestsListClient({ role, basePath, variant, emptyMessage }: RequestsListClientProps) {
  const [items, setItems] = useState<RequestApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorDetails, setLoadErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      const pathname = typeof window !== "undefined" ? window.location.pathname : undefined;
      try {
        const response = await fetch("/api/requests");
        if (!response.ok) {
          let errorMessage = "API error";
          try {
            const body = (await response.json()) as { error?: string };
            if (body?.error) {
              errorMessage = body.error;
            }
          } catch {
            // ignore parsing errors
          }
          throw new Error(errorMessage);
        }
        const data = (await response.json()) as RequestApiItem[];
        if (!isMounted) return;
        setItems(data);
        setLoadError(null);
        setLoadErrorDetails(null);
      } catch (error) {
        if (!isMounted) return;
        console.error("[Requests List] load failed", { pathname, error });
        if (error instanceof Error) {
          console.error(error.message, error.stack);
        }
        if (error instanceof Error) {
          setLoadErrorDetails(error.message);
        } else {
          setLoadErrorDetails(null);
        }
        setLoadError("Impossibile caricare le richieste. Riprova tra poco.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm leading-relaxed text-[#475569]">Caricamento richieste...</p>;
  }

  if (loadError) {
    return (
      <div className="space-y-1">
        <p className="alert-warning">{loadError}</p>
        {process.env.NODE_ENV !== "production" && loadErrorDetails ? (
          <p className="text-xs text-slate-600">Dettaglio errore: {loadErrorDetails}</p>
        ) : null}
      </div>
    );
  }

  if (variant === "company") {
    if (items.length === 0) {
      return (
        <div className="card text-sm leading-relaxed text-[#475569]">
          {emptyMessage ?? "Nessuna richiesta presente. Pubblica la prima per ricevere contatti diretti."}
        </div>
      );
    }
    return (
      <CompanyRequestsTable
        requests={items.map((request) => ({
          id: request.id,
          pickup: request.pickup,
          delivery: request.delivery,
          priceCents: request.price,
          transporterId: request.transporterId,
          createdAt: request.createdAt,
        }))}
        role={role}
        basePath={basePath}
      />
    );
  }

  return (
    <TransporterJobsTable
      requests={items.map((request) => ({
        id: request.id,
        pickup: request.pickup,
        delivery: request.delivery,
        priceCents: request.price,
        transporterId: request.transporterId,
        createdAt: request.createdAt,
      }))}
      role={role}
      basePath={basePath}
    />
  );
}
