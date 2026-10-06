import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

// Stesso pattern già usato in api/auth/reset-password: chiamata diretta
// all'API Resend, nessuna dipendenza aggiuntiva.
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn("[email] RESEND_API_KEY non configurato, invio saltato:", subject);
    return { skipped: true };
  }

  const fromEmail = process.env.FROM_EMAIL || "DodiX <onboarding@resend.dev>";
  const testRecipient = process.env.RESEND_TEST_RECIPIENT;
  const actualTo = testRecipient || to;
  const subjectPrefix = testRecipient ? `[Per: ${to}] ` : "";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [actualTo],
        subject: `${subjectPrefix}${subject}`,
        html,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("[email] invio fallito", response.status, data);
    }

    return { skipped: false, status: response.status, data };
  } catch (error) {
    console.error("[email] errore invio", error);
    return { skipped: false, error };
  }
}

export function emailShell(
  title: string,
  bodyHtml: string,
  ctaHref?: string,
  ctaLabel?: string,
  subtitle = "Borsa Servizi",
) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <div style="background:linear-gradient(135deg,#0b3c5d,#1d6fa5);border-radius:12px;padding:30px;color:#fff;text-align:center;margin-bottom:24px">
      <h1 style="margin:0;font-size:24px">DodiX</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.8">${subtitle}</p>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
      <h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">${title}</h2>
      <div style="color:#475569;font-size:15px;line-height:1.6">${bodyHtml}</div>
      ${
        ctaHref && ctaLabel
          ? `<div style="text-align:center;margin-top:24px"><a href="${ctaHref}" style="display:inline-block;background:#0b3c5d;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600">${ctaLabel}</a></div>`
          : ""
      }
    </div>
  </div>`;
}
