import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoadCard } from "@/components/loads/load-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Panoramica azienda" };

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card card-hover space-y-1">
      <p className="stat-mono text-3xl font-bold text-textStrong">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
    </Link>
  );
}

export default async function CompanyDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "COMPANY") redirect("/dashboard");

  const [loads, me] = await Promise.all([
    prisma.request.findMany({
      where: { companyId: user.id, status: { in: ["OPEN", "ASSIGNED", "CONFIRMED"] } },
      orderBy: { createdAt: "desc" },
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
          where: { status: "PENDING" },
          select: { _count: { select: { messages: { where: { senderId: { not: user.id }, readAt: null } } } } },
        },
      },
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { firstName: true, phone: true, vatVerified: true } }),
  ]);

  const open = loads.filter((l) => l.status === "OPEN");
  const toReview = open.filter((l) => l.applications.length > 0);
  const waiting = loads.filter((l) => l.status === "ASSIGNED");
  const confirmed = loads.filter((l) => l.status === "CONFIRMED");

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Panoramica</p>
          <h1>{me?.firstName ? `Ciao ${me.firstName}` : "Ciao"}</h1>
        </div>
        <Link href="/dashboard/company/new-request" className="btn-primary min-h-[48px]">
          + Pubblica un carico
        </Link>
      </div>

      {(!me?.phone || !me.vatVerified) && (
        <div className="card-muted flex flex-col gap-2 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {!me?.phone
              ? "Aggiungi il cellulare: ti avvisiamo su WhatsApp quando un trasportatore conferma."
              : "Verifica la P.IVA: i trasportatori rispondono di più alle aziende con il badge verificato."}
          </p>
          <Link href="/dashboard/company/profile" className="btn-secondary min-h-[44px] shrink-0">
            Completa il profilo
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Carichi aperti" value={open.length} href="/dashboard/company/requests" />
        <Stat label="Con candidati da valutare" value={toReview.length} href="/dashboard/company/requests" />
        <Stat label="In attesa di conferma" value={waiting.length} href="/dashboard/company/requests" />
        <Stat label="Confermati" value={confirmed.length} href="/dashboard/company/requests" />
      </div>

      {loads.length === 0 ? (
        <div className="card-contrast bg-road space-y-3">
          <h2 className="text-white">Come funziona</h2>
          <ol className="space-y-2 text-sm text-neutral-200">
            <li>1. Pubblichi il carico (gratis, un minuto).</li>
            <li>2. Lo inviamo su WhatsApp ai trasportatori della zona: si candidano con il loro prezzo.</li>
            <li>3. Confronti, scrivi in chat e scegli. Paghi il 2% + IVA solo quando scegli.</li>
            <li>4. Il trasportatore conferma e vi scambiate telefono ed email.</li>
          </ol>
          <Link href="/dashboard/company/new-request" className="btn-primary min-h-[44px] w-fit">
            Pubblica il primo carico
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg">Carichi in corso</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {loads.map((l) => {
              const unread = l.applications.reduce((n, a) => n + a._count.messages, 0);
              const badges: { label: string; tone?: "accent" | "success" | "warning" | "neutral" }[] = [];
              if (l.status === "OPEN")
                badges.push(
                  l.applications.length > 0
                    ? { label: `${l.applications.length} candidat${l.applications.length === 1 ? "o" : "i"} da valutare`, tone: "accent" }
                    : { label: "In attesa di candidature" },
                );
              if (l.status === "ASSIGNED") badges.push({ label: "In attesa di conferma", tone: "warning" });
              if (l.status === "CONFIRMED") badges.push({ label: "Confermato", tone: "success" });
              if (unread > 0) badges.push({ label: `${unread} messaggi nuovi`, tone: "warning" });
              return (
                <LoadCard
                  key={l.id}
                  load={{
                    id: l.id,
                    href: `/dashboard/company/requests/${l.id}`,
                    pickup: l.pickup,
                    delivery: l.delivery,
                    pickupRegion: l.pickupRegion,
                    deliveryRegion: l.deliveryRegion,
                    pickupDate: l.pickupDate,
                    priceCents: l.agreedPrice ?? l.price,
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
        </div>
      )}
    </section>
  );
}
