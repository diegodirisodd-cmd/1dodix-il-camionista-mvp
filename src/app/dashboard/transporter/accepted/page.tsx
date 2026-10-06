import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoadCard, type LoadCardData } from "@/components/loads/load-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "I miei carichi" };

type Group = { key: string; title: string; hint: string; items: LoadCardData[] };

export default async function TransporterMyLoadsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "TRANSPORTER") redirect("/dashboard");

  const apps = await prisma.application.findMany({
    where: { transporterId: user.id, status: { not: "WITHDRAWN" } },
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      request: {
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
          transporterId: true,
        },
      },
      _count: { select: { messages: { where: { senderId: { not: user.id }, readAt: null } } } },
    },
  });

  const groups: Group[] = [
    { key: "todo", title: "Da confermare", hint: "Ti hanno scelto: conferma entro 24 ore.", items: [] },
    { key: "active", title: "Confermati", hint: "Carichi tuoi da eseguire.", items: [] },
    { key: "pending", title: "Candidature in corso", hint: "In attesa della scelta dell'azienda.", items: [] },
    { key: "done", title: "Conclusi", hint: "Consegnati o non assegnati a te.", items: [] },
  ];
  const byKey = Object.fromEntries(groups.map((g) => [g.key, g]));

  for (const a of apps) {
    const r = a.request;
    const mine = r.transporterId === user.id;
    let key = "done";
    let badge: LoadCardData["badges"] = [];
    if (mine && r.status === "ASSIGNED") {
      key = "todo";
      badge = [{ label: "Sei stato scelto", tone: "accent" }];
    } else if (mine && r.status === "CONFIRMED") {
      key = "active";
      badge = [{ label: "Confermato", tone: "success" }];
    } else if (a.status === "PENDING" && (r.status === "OPEN" || r.status === "ASSIGNED")) {
      key = "pending";
      badge = [{ label: r.status === "OPEN" ? "In valutazione" : "Scelto un altro, in attesa" }];
    } else if (mine && r.status === "DELIVERED") {
      badge = [{ label: "Consegnato", tone: "success" }];
    } else {
      badge = [{ label: r.status === "CANCELLED" ? "Annullato" : "Non assegnato a te" }];
    }
    if (a._count.messages > 0) badge.push({ label: `${a._count.messages} messaggi nuovi`, tone: "warning" });
    byKey[key].items.push({
      id: r.id,
      href: `/dashboard/transporter/requests/${r.id}`,
      pickup: r.pickup,
      delivery: r.delivery,
      pickupRegion: r.pickupRegion,
      deliveryRegion: r.deliveryRegion,
      pickupDate: r.pickupDate,
      priceCents: (mine ? r.agreedPrice : null) ?? a.priceCents ?? r.price,
      distanceKm: r.distanceKm ? Number(r.distanceKm) : null,
      vehicleType: r.vehicleType,
      weight: r.weight ? Number(r.weight) : null,
      palletCount: r.palletCount,
      isAdr: r.isAdr,
      createdAt: r.createdAt,
      badges: badge,
    });
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">I miei carichi</p>
        <h1>Candidature e lavori</h1>
      </div>

      {apps.length === 0 ? (
        <div className="card-muted space-y-2 text-sm text-neutral-600">
          <p className="font-semibold text-textStrong">Non ti sei ancora candidato a nessun carico</p>
          <Link href="/dashboard/transporter/jobs" className="btn-primary min-h-[44px] w-fit">
            Vai alla bacheca
          </Link>
        </div>
      ) : (
        groups
          .filter((g) => g.items.length > 0)
          .map((g) => (
            <div key={g.key} className="space-y-3">
              <div>
                <h2 className="text-lg">
                  {g.title} <span className="stat-mono text-neutral-500">({g.items.length})</span>
                </h2>
                <p className="text-xs text-neutral-500">{g.hint}</p>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {g.items.map((item) => (
                  <LoadCard key={item.id} load={item} />
                ))}
              </div>
            </div>
          ))
      )}
    </section>
  );
}
