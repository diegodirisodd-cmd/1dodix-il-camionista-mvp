import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { buildSessionCookie, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = (formData.get("email") as string | null)?.toLowerCase().trim();
    const password = (formData.get("password") as string | null)?.trim();
    const role = (formData.get("role") as string | null)?.toUpperCase();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password e ruolo sono obbligatori." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La password deve contenere almeno 6 caratteri." }, { status: 400 });
    }

    const allowedRoles = ["TRANSPORTER", "COMPANY"] as const;
    const isRoleValid = allowedRoles.includes(role as (typeof allowedRoles)[number]);

    if (!isRoleValid) {
      return NextResponse.json(
        { error: "Ruolo non valido. Seleziona 'trasportatore' o 'azienda'." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Esiste già un utente con questa email." }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: passwordHash, role } });

    // Crea subito una sessione autenticata per l'utente appena registrato.
    const sessionToken = await createSessionToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });

    response.cookies.set(buildSessionCookie(sessionToken));

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registrazione non riuscita." }, { status: 500 });
  }
}
