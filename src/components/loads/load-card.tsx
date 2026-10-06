import Link from "next/link";

import { VEHICLE_LABELS } from "@/lib/catalog";
import { euroPerKm, formatDate, formatEuro, timeAgo } from "@/lib/format";

export type LoadCardData = {
  id: number;
  href: string;
  pickup: string;
  delivery: string;
  pickupRegion: string | null;
  deliveryRegion: string | null;
  pickupDate: Date | null;
  priceCents: number;
  distanceKm: number | null;
  vehicleType: string | null;
  weight: number | null;
  palletCount: number | null;
  isAdr: boolean;
  createdAt: Date;
  /** Badge di stato in alto a destra (es. "Ti sei candidato", "3 candidati"). */
  badges?: { label: string; tone?: "accent" | "success" | "warning" | "neutral" }[];
  footer?: React.ReactNode;
};

const TONE: Record<string, string> = {
  accent: "badge-urgent",
  success: "badge-verified",
  warning: "badge border-warning/40 bg-warning/10 text-warning",
  neutral: "badge",
};

/** Scheda carico usata in bacheca, nei miei carichi e nella lista dell'azienda. */
export function LoadCard({ load }: { load: LoadCardData }) {
  const perKm = euroPerKm(load.priceCents, load.distanceKm);
  const facts = [
    load.vehicleType ? VEHICLE_LABELS[load.vehicleType] ?? load.vehicleType : null,
    load.weight ? `${Number(load.weight).toLocaleString("it-IT")} kg` : null,
    load.palletCount ? `${load.palletCount} pallet` : null,
    load.distanceKm ? `${Number(load.distanceKm).toLocaleString("it-IT")} km` : null,
  ].filter(Boolean);

  return (
    <Link
      href={load.href}
      className="card card-hover block space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-base font-semibold leading-snug text-textStrong sm:text-lg">
            {load.pickup} <span className="text-accent-500">→</span> {load.delivery}
          </p>
          {load.pickupRegion && load.deliveryRegion && (
            <p className="text-xs text-neutral-500">
              {load.pickupRegion === load.deliveryRegion ? load.pickupRegion : `${load.pickupRegion} → ${load.deliveryRegion}`}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="stat-mono text-lg font-bold text-textStrong">{formatEuro(load.priceCents, { round: true })}</p>
          {perKm && <p className="stat-mono text-[11px] text-neutral-500">{perKm} €/km</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {load.pickupDate && (
          <span className="stat-mono rounded-lg bg-brand-900 px-2 py-1 text-xs font-semibold text-white">
            Ritiro {formatDate(load.pickupDate, "long")}
          </span>
        )}
        {facts.map((f) => (
          <span key={f} className="text-xs text-neutral-600">
            {f}
          </span>
        ))}
        {load.isAdr && <span className="badge border-danger/30 bg-danger/10 text-danger">ADR</span>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-2">
        <div className="flex flex-wrap gap-1">
          {(load.badges ?? []).map((b) => (
            <span key={b.label} className={TONE[b.tone ?? "neutral"]}>
              {b.label}
            </span>
          ))}
        </div>
        <span className="table-meta">{load.footer ?? timeAgo(load.createdAt)}</span>
      </div>
    </Link>
  );
}
