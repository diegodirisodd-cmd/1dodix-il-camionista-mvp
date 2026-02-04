import { NextResponse } from "next/server";
import { compare } from "bcryptjs";

import { buildSessionCookie, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routeForUser } from "@/lib/navigation";
import { type Role } from "@/lib/roles";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = (email as string | undefined)?.toLowerCase().trim();
    const normalizedPassword = (password as string | undefined)?.trim();

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json({ error: "Email e password sono obbligatorie." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
    }

    const passwordMatches = await compare(normalizedPassword, user.password);

    if (!passwordMatches) {
      return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
    }

    const role = user.role as Role;
    const onboardingCompleted = true;

    const sessionToken = await createSessionToken({
      sub: String(user.id),
      email: user.email,
      role,
    });
    const redirectTo = routeForUser(role);

    const response = NextResponse.json({
      message: "Accesso eseguito.",
      email: user.email,
      role,
      onboardingCompleted,
      redirectTo,
    });
    response.cookies.set(buildSessionCookie(sessionToken));

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Accesso non riuscito." }, { status: 500 });
  }
}
