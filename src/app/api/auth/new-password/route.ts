import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET || "development-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e nuova password sono obbligatori." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La password deve avere almeno 6 caratteri." },
        { status: 400 }
      );
    }

    // Verifica il token JWT
    let payload;
    try {
      const result = await jwtVerify<{ email: string }>(
        token,
        getAuthSecretKey()
      );
      payload = result.payload;
    } catch {
      return NextResponse.json(
        { error: "Il link è scaduto o non valido. Richiedi un nuovo reset." },
        { status: 400 }
      );
    }

    const email = payload.email;
    const userId = Number(payload.sub);

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Token non valido." },
        { status: 400 }
      );
    }

    // Verifica che l'utente esista
    const user = await prisma.user.findUnique({
      where: { id: userId, email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato." },
        { status: 404 }
      );
    }

    // Hash della nuova password e aggiornamento
    const hashedPassword = await hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Password aggiornata con successo. Ora puoi accedere.",
    });
  } catch (error) {
    console.error("New password error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento. Riprova." },
      { status: 500 }
    );
  }
}
