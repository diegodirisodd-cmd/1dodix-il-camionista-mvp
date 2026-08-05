"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import { Skeleton } from "@/components/skeleton";
import { ITALIAN_PROVINCES } from "@/lib/province";
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_VALUES,
  type ServiceCategory,
} from "@/lib/service-categories";

import { type SupplierProfileItem } from "./types";

// Chiave "categoria|provincia": una zona servita è la coppia dei due valori,
// esattamente come la riga in SupplierServiceArea.
function areaKey(categoria: ServiceCategory, provincia: string) {
  return `${categoria}|${provincia}`;
}

export function SupplierProfileForm() {
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([]);
  const [areas, setAreas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/suppliers/profile");
        const data = (await response.json()) as (SupplierProfileItem | null) & { error?: string };

        if (!response.ok) {
          throw new Error(data?.error ?? "Impossibile caricare il profilo");
        }

        if (!isMounted || !data) return;

        setRagioneSociale(data.ragioneSociale ?? "");
        setPartitaIva(data.partitaIva ?? "");
        setSelectedCategories(
          Array.from(new Set((data.aree ?? []).map((area) => area.categoria))) as ServiceCategory[],
        );
        setAreas(new Set((data.aree ?? []).map((area) => areaKey(area.categoria, area.provincia))));
      } catch (loadError) {
        if (!isMounted) return;
        console.error("[SupplierProfileForm] load failed", loadError);
        setError(loadError instanceof Error ? loadError.message : "Impossibile caricare il profilo");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const provincesByCategory = useMemo(() => {
    const map = new Map<ServiceCategory, string[]>();
    for (const key of Array.from(areas)) {
      const [categoria, provincia] = key.split("|") as [ServiceCategory, string];
      map.set(categoria, [...(map.get(categoria) ?? []), provincia]);
    }
    return map;
  }, [areas]);

  const toggleCategory = (categoria: ServiceCategory) => {
    setSelectedCategories((current) => {
      if (current.includes(categoria)) {
        // Togliendo la categoria si rimuovono anche le sue province.
        setAreas((currentAreas) => {
          const next = new Set(currentAreas);
          for (const key of Array.from(next)) {
            if (key.startsWith(`${categoria}|`)) next.delete(key);
          }
          return next;
        });
        return current.filter((value) => value !== categoria);
      }
      return [...current, categoria];
    });
  };

  const toggleProvince = (categoria: ServiceCategory, provincia: string) => {
    setAreas((current) => {
      const next = new Set(current);
      const key = areaKey(categoria, provincia);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch("/api/suppliers/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ragioneSociale,
          partitaIva: partitaIva || null,
          aree: Array.from(areas).map((key) => {
            const [categoria, provincia] = key.split("|");
            return { categoria, provincia };
          }),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data?.error ?? "Salvataggio non riuscito.");
        return;
      }

      setSuccess("Profilo aggiornato. Riceverai le richieste compatibili con le zone selezionate.");
    } catch (saveError) {
      console.error("[SupplierProfileForm] save failed", saveError);
      setError("Salvataggio non riuscito. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const totalAreas = areas.size;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="alert-danger">{error}</p>}
      {success && <p className="alert-success">{success}</p>}

      <div className="card space-y-5">
        <div className="space-y-1">
          <h2>Dati dell&apos;attività</h2>
          <p>Il nome che i clienti vedono sui tuoi preventivi.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-field">
            <label className="label" htmlFor="ragioneSociale">
              Ragione sociale *
            </label>
            <input
              className="input-field"
              id="ragioneSociale"
              name="ragioneSociale"
              type="text"
              required
              value={ragioneSociale}
              onChange={(event) => setRagioneSociale(event.target.value)}
              placeholder="Officina Rossi S.r.l."
            />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="partitaIva">
              Partita IVA
            </label>
            <input
              className="input-field stat-mono"
              id="partitaIva"
              name="partitaIva"
              type="text"
              value={partitaIva}
              onChange={(event) => setPartitaIva(event.target.value)}
              placeholder="IT12345678901"
            />
          </div>
        </div>
      </div>

      <div className="card space-y-5">
        <div className="space-y-1">
          <h2>Servizi offerti</h2>
          <p>Seleziona le categorie per cui vuoi ricevere richieste.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SERVICE_CATEGORY_VALUES.map((categoria) => {
            const active = selectedCategories.includes(categoria);
            return (
              <button
                key={categoria}
                type="button"
                onClick={() => toggleCategory(categoria)}
                className={clsx(
                  "min-h-[44px] rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-150",
                  active
                    ? "border-accent-500 bg-accent-500 text-white shadow-glow"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-accent-300 hover:text-accent-700",
                )}
                aria-pressed={active}
              >
                {SERVICE_CATEGORY_LABELS[categoria]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2>Zone servite</h2>
            <p>Per ogni servizio, scegli le province in cui intervieni.</p>
          </div>
          <p className="table-meta">
            Coperture attive: <span className="stat-mono text-textStrong">{totalAreas}</span>
          </p>
        </div>

        {selectedCategories.length === 0 ? (
          <p className="card-muted text-sm text-neutral-600">
            Seleziona prima almeno un servizio offerto.
          </p>
        ) : (
          <div className="space-y-6">
            {selectedCategories.map((categoria) => (
              <div key={categoria} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm">{SERVICE_CATEGORY_LABELS[categoria]}</h3>
                  <p className="text-xs text-neutral-500">
                    <span className="stat-mono font-semibold text-textStrong">
                      {provincesByCategory.get(categoria)?.length ?? 0}
                    </span>{" "}
                    province
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ITALIAN_PROVINCES.map((provincia) => {
                    const active = areas.has(areaKey(categoria, provincia));
                    return (
                      <button
                        key={provincia}
                        type="button"
                        onClick={() => toggleProvince(categoria, provincia)}
                        aria-pressed={active}
                        className={clsx(
                          "stat-mono h-11 w-12 sm:h-9 sm:w-11 rounded-md border text-xs font-semibold transition-all duration-150",
                          active
                            ? "border-steel-500 bg-steel-500 text-white"
                            : "border-neutral-200 bg-white text-neutral-500 hover:border-steel-300 hover:text-steel-700",
                        )}
                      >
                        {provincia}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions justify-between">
        <button type="submit" className="btn-primary min-h-[44px] w-full sm:w-auto" disabled={saving}>
          {saving ? "Salvataggio..." : "Salva profilo e zone"}
        </button>
        <p className="text-xs text-neutral-500">
          L&apos;iscrizione come fornitore è gratuita. Paghi solo per sbloccare il contatto su una
          richiesta specifica.
        </p>
      </div>
    </form>
  );
}
