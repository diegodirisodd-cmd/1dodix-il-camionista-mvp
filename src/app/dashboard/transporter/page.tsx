import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoadCard } from "@/components/loads/load-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REQUEST_STATUS } from "@/lib/request-flow";

export const metadata: Metadata = { title: "Panoramica trasportatore" };

export default async function TransporterDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "TRANSPORTER") redirect("/dashboard");

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: { firstName: true, vehicleTypes: true, serviceRegions: true, phone: true },
  });
  const hasProfile = Boolean(me && me.serviceRegions.length > 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const [toConfirm, pending, confirmed, forYou] = await Promise.all([
    prisma.request.findMany({
      where: { transporterId: user.id, status: REQUEST_STATUS.ASSIGNED },
      select: { id: true, pickup: true, delivery: true, agreedPrice: true },
    }),
    prisma.application.count({ where: { transporterId: user.id, status: "PENDING", request: { status: "OPEN" } } }),
    prisma.request.count({ where: { transporterId: user.id, status: REQUEST_STATUS.CONFIRMED } }),
    prisma.request.findMany({
      where: {
        status: REQUEST_STATUS.OPEN,
        OR: [{ pickupDate: null }, { pickupDate: { gte: yesterday } }],
        ...(hasProfile
          ? {
              AND: [
                { OR: [{ pickupRegion: { in: me!.serviceRegions } }, { deliveryRegion: { in: me!.serviceRegions } }] },
                ...(me!.vehicleTypes.length > 0
                  ? [{ OR: [{ vehicleType: { in: me!.vehicleTypes } }, { vehicleType: null }] }]
                  : []),
              ],
            }
          : {}),
        applications: { none: { transporterId: user.id } },
      },
      orderBy: [{ pickupDate: "asc" }, { createdAt: "desc" }],
      take: 6,
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
      },
    }),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Panoramica</p>
        <h1>{me?.firstName ? `Ciao ${me.firstName}` : "Ciao"}</h1>
      </div>

      {toConfirm.map((r) => (
        <Link
          key={r.id}
          href={`/dashboard/transporter/requests/${r.id}`}
          className="card card-hover flex flex-col gap-2 border-2 border-accent-500 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <span className="badge-urgent">Ti hanno scelto</span>
            <p className="mt-2 font-semibold text-textStrong">
              {r.pickup} → {r.delivery}
            </p>
            <p className="text-sm text-neutral-600">Conferma entro 24 ore per ricevere i contatti dell&apos;azienda.</p>
          </div>
          <span className="btn-primary min-h-[44px] shrink-0">Conferma</span>
        </Link>
      ))}

      {!hasProfile && (
        <div className="card flex flex-col gap-3 border-2 border-accent-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-textStrong">Dicci dove lavori e con che mezzi</p>
            <p className="text-sm text-neutral-600">Così ricevi su WhatsApp solo i carichi giusti per te.</p>
          </div>
          <Link href="/dashboard/transporter/profile" className="btn-primary min-h-[44px] shrink-0">
            Completa il profilo
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard/transporter/accepted" className="card card-hover space-y-1">
          <p className="stat-mono text-3xl font-bold text-textStrong">{pending}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Candidature in corso</p>
        </Link>
        <Link href="/dashboard/transporter/accepted" className="card card-hover space-y-1">
          <p className="stat-mono text-3xl font-bold text-textStrong">{toConfirm.length}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Da confermare</p>
        </Link>
        <Link href="/dashboard/transporter/accepted" className="card card-hover space-y-1">
          <p className="stat-mono text-3xl font-bold text-textStrong">{confirmed}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Confermati</p>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">{hasProfile ? "Carichi per te" : "Ultimi carichi"}</h2>
          <Link href="/dashboard/transporter/jobs" className="btn-ghost min-h-[44px]">
            Vedi tutti →
          </Link>
        </div>
        {forYou.length === 0 ? (
          <div className="card-muted text-sm text-neutral-600">
            Nessun carico nuovo nelle tue zone in questo momento. Ti avvisiamo su WhatsApp appena ne esce uno.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {forYou.map((l) => (
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
                  badges: [
                    {
                      label:
                        l._count.applications === 0
                          ? "Nessun candidato: sii il primo"
                          : `${l._count.applications} candidat${l._count.applications === 1 ? "o" : "i"}`,
                      tone: l._count.applications === 0 ? "accent" : "neutral",
                    },
                  ],
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
