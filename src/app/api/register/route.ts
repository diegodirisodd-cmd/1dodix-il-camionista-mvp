import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

const allowedRoles = ["TRANSPORTER", "COMPANY", "ADMIN"] as const;

type AllowedRole = (typeof allowedRoles)[number];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body?.email as string | undefined)?.toLowerCase().trim();
    const password = (body?.password as string | undefined)?.trim();
    const role = (body?.role as string | undefined)?.toUpperCase() as AllowedRole | undefined;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password e ruolo sono obbligatori." }, { status: 400 });
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Ruolo non valido." }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Esiste già un utente con questa email." }, { status: 409 });
    }

    console.error("Errore durante la registrazione", error);
    return NextResponse.json({ error: "Registrazione non riuscita." }, { status: 500 });
  }
}
