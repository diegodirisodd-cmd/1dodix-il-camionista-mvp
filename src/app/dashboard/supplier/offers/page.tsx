import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OfferForm } from "@/components/offers/offer-form";
import { getSessionUser } from "@/lib/auth";
import { OFFER_LIMITS, canSendOffers } from "@/lib/offers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Invia offerta ai trasportatori" };
export const dynamic = "force-dynamic";

export default async function SupplierOffersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPPLIER" || !canSendOffers(user.email)) redirect("/dashboard");

  const [recipients, whatsappRecipients, past] = await Promise.all([
    prisma.user.count({ where: { role: "TRANSPORTER" } }),
    prisma.user.count({ where: { role: "TRANSPORTER", whatsappOptIn: true, phone: { not: null } } }),
    prisma.offer.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Offerte</p>
        <h1>Invia un&apos;offerta ai trasportatori</h1>
        <p className="text-sm text-neutral-600">
          Arriva nella bacheca di tutti i trasportatori e su WhatsApp a chi li ha attivi.
        </p>
      </div>

      <OfferForm
        recipients={recipients}
        whatsappRecipients={whatsappRecipients}
        maxTitle={OFFER_LIMITS.title}
        maxBody={OFFER_LIMITS.body}
      />

      {past.length > 0 && (
        <div className="card space-y-3">
          <h2 className="text-lg">Inviate</h2>
          {past.map((o) => (
            <div key={o.id} className="border-t border-neutral-200 pt-3 text-sm">
              <p className="font-semibold text-textStrong">{o.title}</p>
              <p className="text-neutral-600">
                {o.createdAt.toLocaleString("it-IT", { timeZone: "Europe/Rome" })} · WhatsApp:{" "}
                {o.waStatus === "done" ? `${o.waSent} inviati${o.waFailed ? `, ${o.waFailed} falliti` : ""}` : "in invio"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
