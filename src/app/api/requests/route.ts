import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { estimateRoadKm, formatPlace } from "@/lib/catalog";
import { findPlace } from "@/lib/places";
import { prisma } from "@/lib/prisma";
import {
  buildRequestsListPayload,
  requestsWhereClauseForRole,
} from "@/lib/request-privacy";
import { type Role } from "@/lib/roles";
import { getUnlockStatesForRequests } from "@/lib/unlocks";

export async function GET() {
  const user = await getSessionUser();
  const pathname = "/api/requests";

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const whereClause = requestsWhereClauseForRole(user.role, user.id);

    const requests = await prisma.request.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        pickup: true,
        delivery: true,
        cargo: true,
        cargoType: true,
        price: true,
        createdAt: true,
        pickupDate: true,
        deliveryDate: true,
        vehicleType: true,
        weight: true,
        palletCount: true,
        isAdr: true,
        distanceKm: true,
        transporterId: true,
        unlockedByCompany: true,
        unlockedByTransporter: true,
        companyId: true,
        contactsUnlocked: true,
        company: { select: { email: true, phone: true, companyName: true } },
      },
    });

    const unlockStates = await getUnlockStatesForRequests(
      requests.map((r) => r.id),
      user.id,
      user.role as Role,
    );

    // I contatti azienda escono dal select solo per chi ha sbloccato la
    // richiesta (o ne e' il proprietario): la redazione vive nel payload
    // builder per non poter essere dimenticata qui.
    const enriched = buildRequestsListPayload(requests, unlockStates, {
      id: user.id,
      role: user.role,
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[Requests API] load failed", {
      pathname,
      userId: user.id,
      role: user.role,
      error,
    });

    if (error instanceof Error) {
      console.error(error.message, error.stack);
    }

    return NextResponse.json(
      { error: "Impossibile caricare le richieste" },
      { status: 500 },
    );
  }
}

function toNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(String(val).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function toDateOrNull(val: unknown): Date | null {
  if (typeof val !== "string" || !val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function str(val: unknown, max = 500): string | null {
  return typeof val === "string" && val.trim() ? val.trim().slice(0, max) : null;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (user.role !== "COMPANY") {
    return NextResponse.json({ error: "Solo le aziende possono pubblicare carichi." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

  const placeArg = (v: unknown) => (v && typeof v === "object" ? (v as { city?: unknown; province?: unknown }) : null);
  const pp = placeArg(body.pickupPlace);
  const dp = placeArg(body.deliveryPlace);
  const pickupPlace = pp && typeof pp.city === "string" ? findPlace(pp.city, typeof pp.province === "string" ? pp.province : null) : null;
  const deliveryPlace = dp && typeof dp.city === "string" ? findPlace(dp.city, typeof dp.province === "string" ? dp.province : null) : null;
  if (!pickupPlace || !deliveryPlace) {
    return NextResponse.json({ error: "Scegli i comuni di ritiro e consegna dall'elenco." }, { status: 400 });
  }

  const price = toNumberOrNull(body.price);
  if (!price || price <= 0) return NextResponse.json({ error: "Prezzo non valido" }, { status: 400 });

  const pickupDate = toDateOrNull(body.pickupDate);
  if (!pickupDate) return NextResponse.json({ error: "Indica la data di ritiro." }, { status: 400 });

  const weight = toNumberOrNull(body.weight);
  const palletCount = toNumberOrNull(body.palletCount);
  const cargoType = str(body.cargoType, 40);

  try {
    const created = await prisma.request.create({
      data: {
        companyId: user.id,
        pickup: formatPlace(pickupPlace.city, pickupPlace.province, pickupPlace.city),
        delivery: formatPlace(deliveryPlace.city, deliveryPlace.province, deliveryPlace.city),
        pickupCity: pickupPlace.city,
        pickupProvince: pickupPlace.province,
        pickupRegion: pickupPlace.region,
        pickupLat: pickupPlace.lat,
        pickupLng: pickupPlace.lng,
        deliveryCity: deliveryPlace.city,
        deliveryProvince: deliveryPlace.province,
        deliveryRegion: deliveryPlace.region,
        deliveryLat: deliveryPlace.lat,
        deliveryLng: deliveryPlace.lng,
        pickupAddress: str(body.pickupAddress, 200),
        deliveryAddress: str(body.deliveryAddress, 200),
        distanceKm: estimateRoadKm(pickupPlace, deliveryPlace),
        price: Math.round(price * 100),
        pickupDate,
        deliveryDate: toDateOrNull(body.deliveryDate),
        vehicleType: str(body.vehicleType, 40),
        cargoType,
        cargo: cargoType,
        weight,
        palletCount: palletCount !== null ? Math.round(palletCount) : null,
        volume: str(body.volume, 100),
        isAdr: body.isAdr === true,
        paymentTerms: str(body.paymentTerms, 40),
        description: str(body.description, 2000),
        pickupContact: str(body.pickupContact, 100),
        pickupPhone: str(body.pickupPhone, 40),
      },
      select: { id: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);
    return NextResponse.json({ error: "Impossibile pubblicare il carico." }, { status: 500 });
  }
}
