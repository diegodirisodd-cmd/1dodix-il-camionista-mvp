import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

function createSessionToken(userId: number) {
  const tokenBase = `${userId}:${Date.now()}`;
  return Buffer.from(tokenBase).toString("base64");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = (formData.get("email") as string | null)?.toLowerCase().trim();
    const password = (formData.get("password") as string | null)?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password sono obbligatorie." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
    }

    const passwordMatches = await compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
    }

    const sessionToken = createSessionToken(user.id);
    const response = NextResponse.json({ message: "Accesso eseguito.", email: user.email, role: user.role });
    response.cookies.set({
      name: "dodix_session",
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Accesso non riuscito." }, { status: 500 });
  }
}
