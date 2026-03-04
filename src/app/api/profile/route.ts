import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PROFILE_FIELDS = [
    "firstName",
    "lastName",
    "companyName",
    "vatNumber",
    "address",
    "city",
    "province",
    "zipCode",
    "country",
    "contactPerson",
    "phone",
  ] as const;

export async function GET() {
    const user = await getSessionUser();
    if (!user) {
          return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

  const profile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
                id: true,
                email: true,
                role: true,
                phone: true,
                firstName: true,
                lastName: true,
                companyName: true,
                vatNumber: true,
                address: true,
                city: true,
                province: true,
                zipCode: true,
                country: true,
                contactPerson: true,
                createdAt: true,
        },
  });

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
    const user = await getSessionUser();
    if (!user) {
          return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
          return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
    }

  const data: Record<string, string | null> = {};
    for (const field of PROFILE_FIELDS) {
          if (field in body) {
                  const val = typeof body[field] === "string" ? (body[field] as string).trim() : null;
                  data[field] = val || null;
          }
    }

  if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 });
  }

  const updated = await prisma.user.update({
        where: { id: user.id },
        data,
  });

  return NextResponse.json({
        id: updated.id,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        firstName: updated.firstName,
        lastName: updated.lastName,
        companyName: updated.companyName,
        vatNumber: updated.vatNumber,
        address: updated.address,
        city: updated.city,
        province: updated.province,
        zipCode: updated.zipCode,
        countrimport { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
  import { prisma } from "@/lib/prisma";

const PROFILE_FIELDS = [
    "firstName",
    "lastName",
    "companyName",
    "vatNumber",
    "address",
    "city",
    "province",
    "zipCode",
    "country",
    "contactPerson",
    "phone",
  ] as const;

export async function GET() {
    const user = await getSessionUser();
    if (!user) {
          return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
                  id: true,
                  email: true,
                  role: true,
                  phone: true,
                  firstName: true,
                  lastName: true,
                  companyName: true,
                  vatNumber: true,
                  address: true,
                  city: true,
                  province: true,
                  zipCode: true,
                  country: true,
                  contactPerson: true,
                  createdAt: true,
          },
    });

    return NextResponse.json(profile);
}

export async function PUT(request: Request) {
    const user = await getSessionUser();
    if (!user) {
          return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
          return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
    }

    const data: Record<string, string | null> = {};
    for (const field of PROFILE_FIELDS) {
          if (field in body) {
                  const val = typeof body[field] === "string" ? (body[field] as string).trim() : null;
                  data[field] = val || null;
          }
    }

    if (Object.keys(data).length === 0) {
          return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 });
    }

    const updated = await prisma.user.update({
          where: { id: user.id },
          data,
    });

    return NextResponse.json({
          id: updated.id,
          email: updated.email,
          role: updated.role,
          phone: updated.phone,
          firstName: updated.firstName,
          lastName: updated.lastName,
          companyName: updated.companyName,
          vatNumber: updated.vatNumber,
          address: updated.address,
          city: updated.city,
          province: updated.province,
          zipCode: updated.zipCode,
          country: updated.country,
          contactPerson: updated.contactPerson,
    });
}
