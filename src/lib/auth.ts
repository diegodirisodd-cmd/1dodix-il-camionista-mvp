import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { type Role } from "./roles";

export const SESSION_COOKIE_NAME = "dodix_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 giorni

type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
};

function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET || "development-secret-change-me";

  if (!process.env.AUTH_SECRET) {
    console.warn("AUTH_SECRET non configurato, uso una chiave di sviluppo predefinita.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getAuthSecretKey());

    return {
      userId: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.warn("Token di sessione non valido o scaduto", error);
    return null;
  }
}

export async function getSessionUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await verifySessionToken(token);

  if (!session) return null;

  const { prisma } = await import("./prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return { ...user, subscriptionActive: true };
}

export function buildSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function buildClearedSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  };
}
