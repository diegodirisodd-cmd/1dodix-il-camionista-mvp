import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

const allowedRoles = [UserRole.COMPANY, UserRole.TRANSPORTER] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailRaw = typeof body?.email === "string" ? body.email : undefined;
    const passwordRaw = typeof body?.password === "string" ? body.password : undefined;
    const roleRaw = typeof body?.role === "string" ? body.role : undefined;

    const email = emailRaw?.trim().toLowerCase();
    const password = passwordRaw?.trim();
    const normalizedRole = roleRaw?.toUpperCase() as keyof typeof UserRole | undefined;
    const role = normalizedRole && UserRole[normalizedRole];

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password e ruolo sono obbligatori." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Ruolo non valido." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Esiste già un utente registrato con questa email." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Esiste già un utente con questa email." }, { status: 409 });
    }

    console.error("Errore durante la registrazione", error);
    return NextResponse.json({ error: "Registrazione non riuscita." }, { status: 500 });
  }
}
