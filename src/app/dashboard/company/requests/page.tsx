import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoadCard, type LoadCardData } from "@/components/loads/load-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REQUEST_STATUS_LABELS } from "@/lib/request-flow";

export const metadata: Metadata = { title: "I miei carichi" };

const TONE: Record<string, NonNullable<LoadCardData["badges"]>[number]["tone"]> = {
  OPEN: "accent",
  ASSIGNED: "warning",
  CONFIRMED: "success",
  DELIVERED: "success",
  CANCELLED: "neutral",
};

export default async function CompanyRequestsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "COMPANY") redirect("/dashboard");

  const rows = await prisma.request.findMany({
    where: { companyId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      pickup: true,
      delivery: true,
      pickupRegion: true,
      deliveryRegion: true,
      pickupDate: true,
      price: true,
      agreedPrice: true,
      distanceKm: true,
      vehicleType: true,
      weight: true,
      palletCount: true,
      isAdr: true,
      createdAt: true,
      status: true,
      applications: {
        where: { status: { not: "WITHDRAWN" } },
        select: { _count: { select: { messages: { where: { senderId: { not: user.id }, readAt: null } } } } },
      },
    },
  });

  const active = rows.filter((r) => r.status === "OPEN" || r.status === "ASSIGNED" || r.status === "CONFIRMED");
  const closed = rows.filter((r) => !active.includes(r));

  const toCard = (r: (typeof rows)[number]): LoadCardData => {
    const unread = r.applications.reduce((n, a) => n + a._count.messages, 0);
    const badges: NonNullable<LoadCardData["badges"]> = [
      { label: REQUEST_STATUS_LABELS[r.status] ?? r.status, tone: TONE[r.status] },
    ];
    if (r.status === "OPEN") {
      badges.push({
        label: r.applications.length === 0 ? "Nessun candidato" : `${r.applications.length} candidat${r.applications.length === 1 ? "o" : "i"}`,
        tone: r.applications.length > 0 ? "success" : "neutral",
      });
    }
    if (unread > 0) badges.push({ label: `${unread} messaggi nuovi`, tone: "warning" });
    return {
      id: r.id,
      href: `/dashboard/company/requests/${r.id}`,
      pickup: r.pickup,
      delivery: r.delivery,
      pickupRegion: r.pickupRegion,
      deliveryRegion: r.deliveryRegion,
      pickupDate: r.pickupDate,
      priceCents: r.agreedPrice ?? r.price,
      distanceKm: r.distanceKm ? Number(r.distanceKm) : null,
      vehicleType: r.vehicleType,
      weight: r.weight ? Number(r.weight) : null,
      palletCount: r.palletCount,
      isAdr: r.isAdr,
      createdAt: r.createdAt,
      badges,
    };
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">I miei carichi</p>
          <h1>Carichi pubblicati</h1>
        </div>
        <Link href="/dashboard/company/new-request" className="btn-primary min-h-[44px]">
          + Nuovo carico
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card-muted space-y-2 text-sm text-neutral-600">
          <p className="font-semibold text-textStrong">Non hai ancora pubblicato carichi</p>
          <p>Pubblicare è gratis: il carico arriva su WhatsApp ai trasportatori della zona.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg">In corso</h2>
              <div className="grid gap-3 lg:grid-cols-2">{active.map((r) => <LoadCard key={r.id} load={toCard(r)} />)}</div>
            </div>
          )}
          {closed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg">Conclusi e annullati</h2>
              <div className="grid gap-3 lg:grid-cols-2">{closed.map((r) => <LoadCard key={r.id} load={toCard(r)} />)}</div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
