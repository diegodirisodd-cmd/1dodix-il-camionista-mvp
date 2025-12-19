import { NextResponse } from "next/server";
import { compare } from "bcryptjs";

import { buildSessionCookie, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatorie." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Credenziali non valide." },
        { status: 401 }
      );
    }

    const passwordMatches = await compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Credenziali non valide." },
        { status: 401 }
      );
    }

    const sessionToken = await createSessionToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, redirectTo: "/dashboard" });
    response.cookies.set(buildSessionCookie(sessionToken));

    return response;
  } catch (error) {
    console.error("Errore login", error);
    return NextResponse.json(
      { error: "Impossibile completare il login." },
      { status: 500 }
    );
  }
}
