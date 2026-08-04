import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProvinceCode, normalizeProvince } from "@/lib/province";
import { isServiceCategory, type ServiceCategory } from "@/lib/service-categories";

type ServiceAreaPayload = {
  categoria?: string;
  provincia?: string;
};

type SupplierProfilePayload = {
  ragioneSociale?: string;
  partitaIva?: string;
  // Coppie categoria × provincia coperte dal fornitore. L'elenco inviato
  // sostituisce integralmente quello salvato in precedenza.
  aree?: ServiceAreaPayload[];
};

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Area riservata ai fornitori" }, { status: 403 });
  }

  try {
    const profile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
      include: { aree: { orderBy: [{ categoria: "asc" }, { provincia: "asc" }] } },
    });

    if (!profile) {
      return NextResponse.json(null);
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[SupplierProfile API] load failed", error);
    return NextResponse.json({ error: "Impossibile caricare il profilo" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Area riservata ai fornitori" }, { status: 403 });
  }

  const body: SupplierProfilePayload = await request.json();

  const ragioneSociale = body.ragioneSociale?.trim();
  const partitaIva = body.partitaIva?.trim() || null;

  if (!ragioneSociale) {
    return NextResponse.json({ error: "Ragione sociale obbligatoria" }, { status: 400 });
  }

  const rawAree = Array.isArray(body.aree) ? body.aree : [];
  const aree: { categoria: ServiceCategory; provincia: string }[] = [];
  const seen = new Set<string>();

  for (const area of rawAree) {
    if (!isServiceCategory(area.categoria)) {
      return NextResponse.json(
        { error: `Categoria non valida: ${area.categoria ?? "assente"}` },
        { status: 400 },
      );
    }
    if (!isProvinceCode(area.provincia)) {
      return NextResponse.json(
        { error: `Provincia non valida: ${area.provincia ?? "assente"}` },
        { status: 400 },
      );
    }

    const provincia = normalizeProvince(area.provincia as string);
    const key = `${area.categoria}|${provincia}`;

    if (seen.has(key)) continue;
    seen.add(key);
    aree.push({ categoria: area.categoria, provincia });
  }

  try {
    const profile = await prisma.$transaction(async (tx) => {
      const saved = await tx.supplierProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ragioneSociale, partitaIva },
        update: { ragioneSociale, partitaIva },
      });

      // Sostituzione integrale delle zone servite: più semplice e prevedibile
      // di un diff, e l'elenco resta piccolo (categorie × province coperte).
      await tx.supplierServiceArea.deleteMany({ where: { supplierId: saved.id } });

      if (aree.length > 0) {
        await tx.supplierServiceArea.createMany({
          data: aree.map((area) => ({ ...area, supplierId: saved.id })),
        });
      }

      return tx.supplierProfile.findUnique({
        where: { id: saved.id },
        include: { aree: { orderBy: [{ categoria: "asc" }, { provincia: "asc" }] } },
      });
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[SupplierProfile API] save failed", error);
    return NextResponse.json({ error: "Impossibile salvare il profilo" }, { status: 500 });
  }
}
