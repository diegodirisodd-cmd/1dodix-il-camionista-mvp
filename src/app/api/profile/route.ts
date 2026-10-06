import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { REGIONS, VEHICLE_TYPES } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { checkItalianVat, normalizeItalianPhone } from "@/lib/vies";

const TEXT_FIELDS = ["firstName", "lastName", "companyName", "address", "city", "province", "zipCode", "contactPerson"] as const;

const PROFILE_SELECT = {
  id: true,
  email: true,
  role: true,
  phone: true,
  firstName: true,
  lastName: true,
  companyName: true,
  vatNumber: true,
  vatVerified: true,
  address: true,
  city: true,
  province: true,
  zipCode: true,
  contactPerson: true,
  vehicleTypes: true,
  serviceRegions: true,
  whatsappOptIn: true,
  createdAt: true,
} as const;

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const profile = await prisma.user.findUnique({ where: { id: user.id }, select: PROFILE_SELECT });
  if (!profile) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { vatNumber: true, vatVerified: true } });
  const data: Record<string, unknown> = {};

  for (const field of TEXT_FIELDS) {
    if (field in body) {
      const v = typeof body[field] === "string" ? (body[field] as string).trim().slice(0, 200) : "";
      data[field] = v || null;
    }
  }
  if (typeof data.province === "string") data.province = (data.province as string).toUpperCase().slice(0, 2);

  if ("phone" in body) {
    const phone = normalizeItalianPhone(typeof body.phone === "string" ? body.phone : null);
    if (!phone) return NextResponse.json({ error: "Numero di telefono non valido." }, { status: 400 });
    data.phone = phone;
  }

  if ("whatsappOptIn" in body) data.whatsappOptIn = body.whatsappOptIn === true;

  if (user.role === "TRANSPORTER") {
    if (Array.isArray(body.vehicleTypes)) {
      const allowed = new Set(VEHICLE_TYPES.map((v) => v.value));
      data.vehicleTypes = (body.vehicleTypes as unknown[]).filter((v): v is string => typeof v === "string" && allowed.has(v));
    }
    if (Array.isArray(body.serviceRegions)) {
      const allowed = new Set<string>(REGIONS);
      data.serviceRegions = (body.serviceRegions as unknown[]).filter((v): v is string => typeof v === "string" && allowed.has(v));
    }
  }

  let vatMessage: string | null = null;
  if ("vatNumber" in body) {
    const vat = typeof body.vatNumber === "string" ? body.vatNumber.replace(/\s/g, "").toUpperCase() : "";
    data.vatNumber = vat || null;
    if (!vat) {
      data.vatVerified = false;
      data.vatVerifiedAt = null;
    } else if (vat !== current?.vatNumber || !current?.vatVerified) {
      const check = await checkItalianVat(vat);
      if (check === null) {
        vatMessage = "Il servizio europeo di verifica P.IVA non risponde: riproveremo al prossimo salvataggio.";
        data.vatVerified = false;
      } else if (!check.valid) {
        return NextResponse.json({ error: "Partita IVA non trovata nel registro europeo (VIES)." }, { status: 400 });
      } else {
        data.vatVerified = true;
        data.vatVerifiedAt = new Date();
        if (!("companyName" in body) || !data.companyName) {
          if (check.name) data.companyName = check.name;
        }
      }
    }
  }

  if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 });

  const updated = await prisma.user.update({ where: { id: user.id }, data, select: PROFILE_SELECT });
  return NextResponse.json({ ...updated, vatMessage });
}
