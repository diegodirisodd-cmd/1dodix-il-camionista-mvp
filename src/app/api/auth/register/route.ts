import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = (formData.get("email") as string | null)?.toLowerCase().trim();
    const password = (formData.get("password") as string | null)?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password sono obbligatorie." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La password deve contenere almeno 6 caratteri." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Esiste già un utente con questa email." }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    return NextResponse.json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registrazione non riuscita." }, { status: 500 });
  }
}
