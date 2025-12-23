import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

import { buildSessionCookie, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routeForUser } from "@/lib/navigation";
import { type Role, REGISTRABLE_ROLES } from "@/lib/roles";

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();
    const normalizedEmail = (email as string | undefined)?.toLowerCase().trim();
    const normalizedRole = (role as string | undefined)?.toUpperCase() as Role | undefined;

    if (!normalizedEmail || !password || !normalizedRole) {
      return NextResponse.json({ error: "Email, password e ruolo sono obbligatori." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La password deve contenere almeno 6 caratteri." }, { status: 400 });
    }

    const allowedRoles: Role[] = REGISTRABLE_ROLES;
    const selectedRole = allowedRoles.find((allowed) => allowed === normalizedRole);

    if (!selectedRole) {
      return NextResponse.json({ error: "Ruolo non valido. Seleziona trasportatore o azienda." }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        role: selectedRole,
        subscriptionActive: false,
        subscriptionStatus: "inactive",
        onboardingCompleted: false,
      },
    });

    const sessionToken = await createSessionToken({
      sub: String(user.id),
      email: user.email,
      role: user.role as Role,
    });

    const response = NextResponse.json(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        redirectTo: routeForUser({ role: user.role as Role, onboardingCompleted: false }),
      },
      { status: 201 },
    );

    response.cookies.set(buildSessionCookie(sessionToken));

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Esiste già un utente con questa email." }, { status: 409 });
    }

    console.error("Errore nella registrazione", error);
    return NextResponse.json({ error: "Registrazione non riuscita." }, { status: 500 });
  }
}
