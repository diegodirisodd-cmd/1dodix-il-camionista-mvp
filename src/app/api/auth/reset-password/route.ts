import { NextResponse } from "next/server";
import { SignJWT } from "jose";

import { prisma } from "@/lib/prisma";

const RESET_TOKEN_EXPIRY = 60 * 60; // 1 ora

function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET || "development-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = (email as string | undefined)?.toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "L'email è obbligatoria." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({
        message: "Se l'email è registrata, riceverai un link per reimpostare la password.",
      });
    }

    const resetToken = await new SignJWT({ email: normalizedEmail })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(user.id))
      .setIssuedAt()
      .setExpirationTime(`${RESET_TOKEN_EXPIRY}s`)
      .sign(getAuthSecretKey());

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const fromEmail = process.env.FROM_EMAIL || "DodiX <onboarding@resend.dev>";
      const testRecipient = process.env.RESEND_TEST_RECIPIENT;
      const actualTo = testRecipient || normalizedEmail;
      const subjectPrefix = testRecipient ? `[Per: ${normalizedEmail}] ` : "";

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [actualTo],
          subject: `${subjectPrefix}DodiX - Reimposta la tua password`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><div style="background:linear-gradient(135deg,#0b3c5d,#1d6fa5);border-radius:12px;padding:30px;color:#fff;text-align:center;margin-bottom:24px"><h1 style="margin:0;font-size:24px">DodiX</h1><p style="margin:4px 0 0;font-size:13px;opacity:.8">Il Camionista</p></div><div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Reimposta la tua password</h2><p style="color:#475569;font-size:15px;line-height:1.6">Hai richiesto di reimpostare la password del tuo account DodiX. Clicca il pulsante qui sotto per scegliere una nuova password.</p><p style="color:#94a3b8;font-size:13px">Il link scade tra 1 ora. Se non hai richiesto il reset, ignora questa email.</p><div style="text-align:center;margin-top:24px"><a href="${resetLink}" style="display:inline-block;background:#0b3c5d;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600">Reimposta password</a></div></div></div>`,
        }),
      });
    }

    return NextResponse.json({
      message: "Se l'email è registrata, riceverai un link per reimpostare la password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Errore durante la richiesta. Riprova." },
      { status: 500 }
    );
  }
}
