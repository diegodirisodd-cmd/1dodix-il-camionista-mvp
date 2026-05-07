import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type Role } from "@/lib/roles";
import { getUnlockStatesForRequests } from "@/lib/unlocks";

type RequestPayload = {
  pickup?: string;
  delivery?: string;
  cargo?: string;
  cargoType?: string;
  description?: string;
  price?: number | string;
  budget?: number | string;
  priceString?: string;
  pickupDate?: string;
  deliveryDate?: string;
  weight?: number | string;
  volume?: string;
  palletCount?: number | string;
  vehicleType?: string;
  isAdr?: boolean;
  paymentTerms?: string;
  pickupContact?: string;
  pickupPhone?: string;
  distanceKm?: number | string;
};

export async function GET() {
  const user = await getSessionUser();
  const pathname = "/api/requests";

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const whereClause =
      user.role === "COMPANY"
        ? { companyId: user.id }
        : user.role === "TRANSPORTER"
          ? { transporterId: null }
          : undefined;

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

    const enriched = requests.map((r) => {
      const state = unlockStates.get(r.id) ?? {
        unlockedByMe: false,
        unlockedByOther: false,
        bothUnlocked: false,
      };
      return {
        ...r,
        unlockedForCurrentUser: state.unlockedByMe,
        unlockedByOtherParty: state.unlockedByOther,
        bothPartiesUnlocked: state.bothUnlocked,
      };
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

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json(
      { error: "Gli admin possono solo consultare le richieste" },
      { status: 403 },
    );
  }

  if (user.role !== "COMPANY") {
    return NextResponse.json(
      { error: "Solo le aziende possono pubblicare richieste" },
      { status: 403 },
    );
  }

  const body: RequestPayload = await request.json();

  const rawPrice = body.price ?? body.budget ?? body.priceString;

  if (!rawPrice) {
    return NextResponse.json({ error: "Prezzo obbligatorio" }, { status: 400 });
  }

  const priceNumber = Number(rawPrice);

  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    return NextResponse.json({ error: "Prezzo non valido" }, { status: 400 });
  }

  const priceInCents = Math.round(priceNumber * 100);

  const pickup = body.pickup?.trim() ?? "";
  const delivery = body.delivery?.trim() ?? "";
  const cargo = body.cargo?.trim() ?? body.cargoType?.trim() ?? null;
  const description = body.description?.trim() || null;

  if (!pickup || !delivery) {
    return NextResponse.json(
      { error: "Ritiro e consegna obbligatori." },
      { status: 400 },
    );
  }

  const toDateOrNull = (val: string | undefined | null): Date | null => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const toNumberOrNull = (val: unknown): number | null => {
    if (val === null || val === undefined || val === "") return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  try {
    const newRequest = await prisma.request.create({
      data: {
        pickup,
        delivery,
        cargo,
        description,
        price: priceInCents,
        companyId: user.id,
        cargoType: body.cargoType?.trim() || null,
        pickupDate: toDateOrNull(body.pickupDate),
        deliveryDate: toDateOrNull(body.deliveryDate),
        weight: toNumberOrNull(body.weight),
        volume: body.volume?.trim() || null,
        palletCount: toNumberOrNull(body.palletCount) ? Math.round(Number(body.palletCount)) : null,
        vehicleType: body.vehicleType?.trim() || null,
        isAdr: body.isAdr ?? false,
        paymentTerms: body.paymentTerms?.trim() || null,
        pickupContact: body.pickupContact?.trim() || null,
        pickupPhone: body.pickupPhone?.trim() || null,
        distanceKm: toNumberOrNull(body.distanceKm),
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);
    return NextResponse.json(
      { error: "Impossibile creare la richiesta", details: String(error) },
      { status: 500 },
    );
  }
}
