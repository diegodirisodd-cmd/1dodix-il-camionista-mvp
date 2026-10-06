import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { MAX_PRICE_EUR, MIN_PRICE_EUR, estimateRoadKm, formatPlace, parseEuroToCents, priceOutOfRange } from "@/lib/catalog";
import { findPlace } from "@/lib/places";
import { prisma } from "@/lib/prisma";
import { maskContacts } from "@/lib/request-flow";

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

// Testi visibili a tutti i trasportatori: niente telefoni o email, che
// saltano lo scambio contatti dopo la conferma (vanno nei campi referente).
function publicText(val: unknown, max: number): string | null {
  const v = str(val, max);
  return v ? maskContacts(v).text : null;
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

  const priceCents = parseEuroToCents(body.price);
  if (priceCents === null || priceOutOfRange(priceCents)) {
    return NextResponse.json(
      { error: `Prezzo non valido: indica un importo fra ${MIN_PRICE_EUR} e ${MAX_PRICE_EUR.toLocaleString("it-IT")} €.` },
      { status: 400 },
    );
  }

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
        price: priceCents,
        pickupDate,
        deliveryDate: toDateOrNull(body.deliveryDate),
        vehicleType: str(body.vehicleType, 40),
        cargoType,
        cargo: cargoType,
        weight,
        palletCount: palletCount !== null ? Math.round(palletCount) : null,
        volume: publicText(body.volume, 100),
        isAdr: body.isAdr === true,
        paymentTerms: str(body.paymentTerms, 40),
        description: publicText(body.description, 2000),
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
