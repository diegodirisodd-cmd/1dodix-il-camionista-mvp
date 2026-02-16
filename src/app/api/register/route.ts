import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { type Role, REGISTRABLE_ROLES } from "@/lib/roles";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailRaw = typeof body?.email === "string" ? body.email : undefined;
    const passwordRaw = typeof body?.password === "string" ? body.password : undefined;
    const roleRaw = typeof body?.role === "string" ? body.role : undefined;

    const email = emailRaw?.trim().toLowerCase();
    const rawPassword = passwordRaw?.trim();
    const normalizedRole = roleRaw?.toUpperCase() as Role | undefined;
    const allowedRoles: Role[] = REGISTRABLE_ROLES;
    const role = normalizedRole && allowedRoles.find((candidate) => candidate === normalizedRole);

    if (!email || !rawPassword || !role) {
      return NextResponse.json(
        { error: "Email, password e ruolo sono obbligatori." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Esiste già un utente registrato con questa email." },
        { status: 409 }
      );
    }

    const password = await hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password,
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
