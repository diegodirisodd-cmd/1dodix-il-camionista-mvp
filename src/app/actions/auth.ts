"use server";

import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { buildSessionCookie, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedRoles = ["COMPANY", "TRANSPORTER"] as const;

function normalizeRole(raw: string | null) {
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase();
  return allowedRoles.includes(normalized as (typeof allowedRoles)[number]) ? normalized : null;
}

export async function actionRegister(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = (formData.get("password") as string | null)?.trim();
  const role = normalizeRole(formData.get("role") as string | null);
  const name = (formData.get("name") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim();
  const operatingArea = (formData.get("operatingArea") as string | null)?.trim();

  if (!email || !password || !role) {
    return { error: "Email, password e ruolo sono obbligatori." };
  }

  if (password.length < 6) {
    return { error: "La password deve avere almeno 6 caratteri." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Esiste già un account registrato con questa email." };
    }

    const passwordHash = await hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
        name: name || null,
        phone: phone || null,
        operatingArea: operatingArea || null,
        subscriptionActive: false,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Esiste già un account registrato con questa email." };
    }

    console.error("Errore durante la registrazione", error);
    return { error: "Registrazione non riuscita. Riprova tra qualche istante." };
  }
}

export async function actionLogin(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = (formData.get("password") as string | null)?.trim();

  if (!email || !password) {
    return { error: "Email e password sono obbligatorie." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "Credenziali non valide" };
    }

    const validPassword = await compare(password, user.password);

    if (!validPassword) {
      return { error: "Credenziali non valide" };
    }

    const sessionToken = await createSessionToken({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    cookies().set(buildSessionCookie(sessionToken));

    const redirectTo = user.role === "COMPANY" ? "/dashboard/company" : "/dashboard/transporter";

    return { success: true, redirectTo };
  } catch (error) {
    console.error("Errore durante il login", error);
    return { error: "Accesso non riuscito. Riprova tra qualche istante." };
  }
}
