import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoadCard } from "@/components/loads/load-card";
import { getSessionUser } from "@/lib/auth";
import { REGIONS, VEHICLE_TYPES } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { REQUEST_STATUS } from "@/lib/request-flow";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Bacheca carichi" };

type Search = { vista?: string; da?: string; a?: string; mezzo?: string; ordine?: string };

export default async function TransporterJobsPage({ searchParams }: { searchParams?: Search }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "TRANSPORTER") redirect("/dashboard");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { vehicleTypes: true, serviceRegions: true },
  });
  const hasProfile = Boolean(profile && (profile.serviceRegions.length > 0 || profile.vehicleTypes.length > 0));
  const view = searchParams?.vista === "tutti" || !hasProfile ? "tutti" : "per-te";
  const from = REGIONS.includes(searchParams?.da as (typeof REGIONS)[number]) ? searchParams!.da! : "";
  const to = REGIONS.includes(searchParams?.a as (typeof REGIONS)[number]) ? searchParams!.a! : "";
  const vehicle = VEHICLE_TYPES.some((v) => v.value === searchParams?.mezzo) ? searchParams!.mezzo! : "";
  const order = searchParams?.ordine === "prezzo" ? "prezzo" : searchParams?.ordine === "nuovi" ? "nuovi" : "data";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const and: Prisma.RequestWhereInput[] = [
    { status: REQUEST_STATUS.OPEN, transporterId: null },
    { OR: [{ pickupDate: null }, { pickupDate: { gte: yesterday } }] },
  ];
  if (from) and.push({ pickupRegion: from });
  if (to) and.push({ deliveryRegion: to });
  if (vehicle) and.push({ OR: [{ vehicleType: vehicle }, { vehicleType: null }] });
  if (view === "per-te" && profile) {
    if (profile.serviceRegions.length > 0) {
      and.push({
        OR: [{ pickupRegion: { in: profile.serviceRegions } }, { deliveryRegion: { in: profile.serviceRegions } }],
      });
    }
    if (profile.vehicleTypes.length > 0 && !vehicle) {
      and.push({ OR: [{ vehicleType: { in: profile.vehicleTypes } }, { vehicleType: null }] });
    }
  }

  const loads = await prisma.request.findMany({
    where: { AND: and },
    orderBy:
      order === "prezzo" ? { price: "desc" } : order === "nuovi" ? { createdAt: "desc" } : [{ pickupDate: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      pickup: true,
      delivery: true,
      pickupRegion: true,
      deliveryRegion: true,
      pickupDate: true,
      price: true,
      distanceKm: true,
      vehicleType: true,
      weight: true,
      palletCount: true,
      isAdr: true,
      createdAt: true,
      _count: { select: { applications: true } },
      applications: { where: { transporterId: user.id }, select: { status: true } },
    },
  });

  const totalOpen = await prisma.request.count({
    where: { status: REQUEST_STATUS.OPEN, OR: [{ pickupDate: null }, { pickupDate: { gte: yesterday } }] },
  });

  const qs = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    const merged = { vista: view, da: from, a: to, mezzo: vehicle, ordine: order, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `?${p.toString()}`;
  };

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Bacheca carichi</p>
        <h1>Carichi disponibili</h1>
        <p className="text-sm text-neutral-600">
          Candidarsi è gratis. Paghi la commissione solo se l&apos;azienda ti sceglie e confermi.
        </p>
      </div>

      {!hasProfile && (
        <div className="card flex flex-col gap-3 border-2 border-accent-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-textStrong">Dicci dove lavori e con che mezzi</p>
            <p className="text-sm text-neutral-600">Così ti mostriamo prima i carichi giusti e ti avvisiamo solo per quelli.</p>
          </div>
          <Link href="/dashboard/transporter/profile" className="btn-primary min-h-[44px] shrink-0">
            Completa il profilo
          </Link>
        </div>
      )}

      {hasProfile && (
        <div className="flex gap-2" role="tablist">
          <Link
            href={qs({ vista: "per-te" })}
            role="tab"
            aria-selected={view === "per-te"}
            className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold ${view === "per-te" ? "bg-brand-900 text-white" : "border border-neutral-200 bg-white text-textStrong"}`}
          >
            Per te
          </Link>
          <Link
            href={qs({ vista: "tutti" })}
            role="tab"
            aria-selected={view === "tutti"}
            className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold ${view === "tutti" ? "bg-brand-900 text-white" : "border border-neutral-200 bg-white text-textStrong"}`}
          >
            Tutti <span className="stat-mono">({totalOpen})</span>
          </Link>
        </div>
      )}

      <form className="card grid gap-3 sm:grid-cols-5" method="get">
        <input type="hidden" name="vista" value={view} />
        <label className="form-field">
          <span className="label">Partenza</span>
          <select name="da" defaultValue={from} className="input-field">
            <option value="">Tutte le regioni</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="label">Arrivo</span>
          <select name="a" defaultValue={to} className="input-field">
            <option value="">Tutte le regioni</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="label">Mezzo</span>
          <select name="mezzo" defaultValue={vehicle} className="input-field">
            <option value="">Qualsiasi</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="label">Ordina per</span>
          <select name="ordine" defaultValue={order} className="input-field">
            <option value="data">Data di ritiro</option>
            <option value="nuovi">Più recenti</option>
            <option value="prezzo">Prezzo più alto</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary min-h-[44px] flex-1">
            Filtra
          </button>
          {(from || to || vehicle) && (
            <Link href={qs({ da: "", a: "", mezzo: "" })} className="btn-ghost min-h-[44px]">
              Azzera
            </Link>
          )}
        </div>
      </form>

      {loads.length === 0 ? (
        <div className="card-muted space-y-2 text-sm text-neutral-600">
          <p className="font-semibold text-textStrong">Nessun carico con questi filtri</p>
          <p>
            {view === "per-te"
              ? "Al momento non ci sono carichi nelle tue zone. Ti avvisiamo su WhatsApp appena ne esce uno."
              : "Prova a togliere qualche filtro."}
          </p>
          {view === "per-te" && (
            <Link href={qs({ vista: "tutti" })} className="btn-secondary min-h-[44px] w-fit">
              Vedi tutti i carichi
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {loads.map((l) => {
            const mine = l.applications[0];
            const badges: { label: string; tone?: "accent" | "success" | "warning" | "neutral" }[] = [];
            if (mine && mine.status === "PENDING") badges.push({ label: "Ti sei candidato", tone: "success" });
            badges.push({
              label: l._count.applications === 0 ? "Nessun candidato" : `${l._count.applications} candidat${l._count.applications === 1 ? "o" : "i"}`,
            });
            return (
              <LoadCard
                key={l.id}
                load={{
                  id: l.id,
                  href: `/dashboard/transporter/requests/${l.id}`,
                  pickup: l.pickup,
                  delivery: l.delivery,
                  pickupRegion: l.pickupRegion,
                  deliveryRegion: l.deliveryRegion,
                  pickupDate: l.pickupDate,
                  priceCents: l.price,
                  distanceKm: l.distanceKm ? Number(l.distanceKm) : null,
                  vehicleType: l.vehicleType,
                  weight: l.weight ? Number(l.weight) : null,
                  palletCount: l.palletCount,
                  isAdr: l.isAdr,
                  createdAt: l.createdAt,
                  badges,
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
