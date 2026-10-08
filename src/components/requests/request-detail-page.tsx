import Link from "next/link";
import { redirect } from "next/navigation";

import { LoadDetail, type LoadDetailData, type CandidateSummary } from "@/components/loads/load-detail";
import { getSessionUser } from "@/lib/auth";
import { calculateCommission } from "@/lib/commission";
import { freeUnlockStatus } from "@/lib/free-unlock";
import { displayName } from "@/lib/load-flow";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS, REQUEST_STATUS, canApply, effectivePriceCents } from "@/lib/request-flow";

type RequestDetailPageProps = {
  requestId: number;
  backHref: string;
};

function NotAvailable({ title, text, backHref }: { title: string; text: string; backHref: string }) {
  return (
    <section className="card space-y-3">
      <h1 className="text-2xl">{title}</h1>
      <p className="text-sm text-neutral-600">{text}</p>
      <Link href={backHref} className="btn-secondary min-h-[44px] w-fit">
        Torna indietro
      </Link>
    </section>
  );
}

async function transporterStats(ids: number[]) {
  if (ids.length === 0) return new Map<number, { delivered: number; rating: number | null; reviews: number }>();
  const [delivered, ratings] = await Promise.all([
    prisma.request.groupBy({
      by: ["transporterId"],
      where: { transporterId: { in: ids }, status: REQUEST_STATUS.DELIVERED },
      _count: { _all: true },
    }),
    prisma.review.groupBy({
      by: ["targetId"],
      where: { targetId: { in: ids } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);
  const map = new Map<number, { delivered: number; rating: number | null; reviews: number }>();
  for (const id of ids) map.set(id, { delivered: 0, rating: null, reviews: 0 });
  for (const d of delivered) if (d.transporterId) map.get(d.transporterId)!.delivered = d._count._all;
  for (const r of ratings) {
    const entry = map.get(r.targetId)!;
    entry.rating = r._avg.rating;
    entry.reviews = r._count._all;
  }
  return map;
}

export async function RequestDetailPage({ requestId, backHref }: RequestDetailPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!Number.isInteger(requestId)) {
    return <NotAvailable title="Carico non valido" text="L'indirizzo della pagina non è corretto." backHref={backHref} />;
  }
  if (!["COMPANY", "TRANSPORTER", "ADMIN"].includes(user.role)) redirect(routeForUser(user.role));

  const load = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          firstName: true,
          lastName: true,
          city: true,
          province: true,
          vatVerified: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
    },
  });

  if (!load) {
    return <NotAvailable title="Carico non trovato" text="Il carico non esiste o è stato rimosso." backHref={backHref} />;
  }

  const isOwner = user.role === "COMPANY" && load.companyId === user.id;
  if (user.role === "COMPANY" && !isOwner) redirect("/dashboard/company/requests");

  const myApplication =
    user.role === "TRANSPORTER"
      ? await prisma.application.findUnique({
          where: { requestId_transporterId: { requestId, transporterId: user.id } },
        })
      : null;

  // Un trasportatore vede i carichi aperti e quelli a cui ha partecipato.
  if (user.role === "TRANSPORTER" && load.status !== REQUEST_STATUS.OPEN && !myApplication) {
    return (
      <NotAvailable
        title="Carico non più disponibile"
        text="Questo carico è già stato assegnato o è stato chiuso dall'azienda."
        backHref={backHref}
      />
    );
  }

  const contactsOpen = load.status === REQUEST_STATUS.CONFIRMED || load.status === REQUEST_STATUS.DELIVERED;
  const iAmAssigned = user.role === "TRANSPORTER" && load.transporterId === user.id;

  const companyPaid = isOwner
    ? Boolean(
        await prisma.requestUnlock.findUnique({
          where: { requestId_userId: { requestId, userId: user.id } },
          select: { id: true },
        }),
      )
    : false;

  // Primo sblocco gratuito: lo mostriamo solo a chi puo' usarlo su questa pagina.
  const freeUnlockState =
    (isOwner && !companyPaid) || user.role === "TRANSPORTER" ? await freeUnlockStatus(user.id) : "used";

  let candidates: CandidateSummary[] = [];
  if (isOwner || user.role === "ADMIN") {
    const apps = await prisma.application.findMany({
      where: { requestId, status: { not: APPLICATION_STATUS.WITHDRAWN } },
      orderBy: { createdAt: "asc" },
      include: {
        transporter: {
          select: {
            id: true,
            companyName: true,
            firstName: true,
            lastName: true,
            province: true,
            city: true,
            vehicleTypes: true,
            serviceRegions: true,
            vatVerified: true,
            createdAt: true,
            email: true,
            phone: true,
          },
        },
        _count: { select: { messages: { where: { senderId: { not: user.id }, readAt: null } } } },
      },
    });
    const stats = await transporterStats(apps.map((a) => a.transporterId));
    candidates = apps.map((a) => {
      const isChosen = load.transporterId === a.transporterId && a.status === APPLICATION_STATUS.SELECTED;
      const showContacts = contactsOpen && load.transporterId === a.transporterId;
      return {
        applicationId: a.id,
        status: a.status,
        name: displayName(a.transporter),
        place: a.transporter.city
          ? `${a.transporter.city}${a.transporter.province ? ` (${a.transporter.province})` : ""}`
          : a.transporter.province ?? null,
        vehicleTypes: a.transporter.vehicleTypes,
        serviceRegions: a.transporter.serviceRegions,
        vatVerified: a.transporter.vatVerified,
        memberSince: a.transporter.createdAt.toISOString(),
        delivered: stats.get(a.transporterId)?.delivered ?? 0,
        rating: stats.get(a.transporterId)?.rating ?? null,
        reviews: stats.get(a.transporterId)?.reviews ?? 0,
        priceCents: effectivePriceCents(load.price, a.priceCents),
        proposedDifferentPrice: Boolean(a.priceCents && a.priceCents !== load.price),
        message: a.message,
        selectedAt: a.selectedAt?.toISOString() ?? null,
        unread: a._count.messages,
        isChosen,
        commissionCents: calculateCommission(effectivePriceCents(load.price, a.priceCents)).total,
        contacts: showContacts ? { email: a.transporter.email, phone: a.transporter.phone } : null,
      };
    });
  }

  let myUnread = 0;
  if (myApplication) {
    myUnread = await prisma.message.count({
      where: { applicationId: myApplication.id, senderId: { not: user.id }, readAt: null },
    });
  }

  const companyContactsVisible = contactsOpen && (iAmAssigned || user.role === "ADMIN");
  const reviewByMe = await prisma.review.findUnique({
    where: { requestId_authorId: { requestId, authorId: user.id } },
    select: { rating: true },
  });

  const data: LoadDetailData = {
    id: load.id,
    role: user.role as LoadDetailData["role"],
    backHref,
    status: load.status,
    pickup: load.pickup,
    delivery: load.delivery,
    pickupRegion: load.pickupRegion,
    deliveryRegion: load.deliveryRegion,
    pickupDate: load.pickupDate?.toISOString() ?? null,
    deliveryDate: load.deliveryDate?.toISOString() ?? null,
    priceCents: load.price,
    // Il prezzo concordato lo vedono solo le due parti dell'accordo.
    agreedPriceCents: isOwner || iAmAssigned || user.role === "ADMIN" ? load.agreedPrice : null,
    distanceKm: load.distanceKm ? Number(load.distanceKm) : null,
    cargo: load.cargo,
    cargoType: load.cargoType,
    description: load.description,
    vehicleType: load.vehicleType,
    weight: load.weight ? Number(load.weight) : null,
    volume: load.volume,
    palletCount: load.palletCount,
    isAdr: load.isAdr,
    paymentTerms: load.paymentTerms,
    createdAt: load.createdAt.toISOString(),
    assignedAt: load.assignedAt?.toISOString() ?? null,
    company: {
      name: displayName(load.company, "Azienda DodiX"),
      place: load.company.city
        ? `${load.company.city}${load.company.province ? ` (${load.company.province})` : ""}`
        : null,
      vatVerified: load.company.vatVerified,
      memberSince: load.company.createdAt.toISOString(),
      contacts: companyContactsVisible
        ? {
            email: load.company.email,
            phone: load.company.phone,
            pickupContact: load.pickupContact,
            pickupPhone: load.pickupPhone,
            pickupAddress: load.pickupAddress,
            deliveryAddress: load.deliveryAddress,
          }
        : null,
    },
    ownerDetails:
      isOwner || user.role === "ADMIN"
        ? {
            pickupAddress: load.pickupAddress,
            deliveryAddress: load.deliveryAddress,
            pickupContact: load.pickupContact,
            pickupPhone: load.pickupPhone,
          }
        : null,
    canApply: canApply(load),
    companyPaid,
    candidates,
    myApplication: myApplication
      ? {
          id: myApplication.id,
          status: myApplication.status,
          priceCents: myApplication.priceCents,
          message: myApplication.message,
          selectedAt: myApplication.selectedAt?.toISOString() ?? null,
          unread: myUnread,
        }
      : null,
    iAmAssigned,
    myCommissionCents: calculateCommission(load.agreedPrice ?? load.price).total,
    freeUnlock: freeUnlockState === "available",
    freeUnlockNeedsVat: freeUnlockState === "needs_verified_vat",
    reviewedByMe: reviewByMe?.rating ?? null,
  };

  return <LoadDetail data={data} />;
}
