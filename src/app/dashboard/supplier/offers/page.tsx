import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OfferForm } from "@/components/offers/offer-form";
import { getSessionUser } from "@/lib/auth";
import { REGION_PROVINCES, REGIONS } from "@/lib/catalog";
import { OFFER_LIMITS, canSendOffers } from "@/lib/offers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Invia offerta ai trasportatori" };
export const dynamic = "force-dynamic";

export default async function SupplierOffersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPPLIER" || !canSendOffers(user.email)) redirect("/dashboard");

  const [carriers, past] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TRANSPORTER" },
      select: { province: true, whatsappOptIn: true, phone: true },
    }),
    prisma.offer.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  // Destinatari per regione della sede (sigla di provincia), per il riepilogo prima dell'invio.
  const audience: Record<string, { all: number; whatsapp: number }> = { "": { all: 0, whatsapp: 0 } };
  for (const r of REGIONS) audience[r] = { all: 0, whatsapp: 0 };
  for (const c of carriers) {
    const prov = (c.province ?? "").trim().toUpperCase();
    const wa = c.whatsappOptIn && Boolean(c.phone);
    const region = REGIONS.find((r) => REGION_PROVINCES[r].includes(prov));
    for (const key of region ? ["", region] : [""]) {
      audience[key].all += 1;
      if (wa) audience[key].whatsapp += 1;
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Offerte</p>
        <h1>Invia un&apos;offerta ai trasportatori</h1>
        <p className="text-sm text-neutral-600">
          Arriva nella bacheca dei trasportatori scelti (tutti o con sede in una regione) e su WhatsApp a chi li ha attivi.
        </p>
      </div>

      <OfferForm
        audience={audience}
        regions={[...REGIONS]}
        maxTitle={OFFER_LIMITS.title}
        maxBody={OFFER_LIMITS.body}
      />

      {past.length > 0 && (
        <div className="card space-y-3">
          <h2 className="text-lg">Inviate</h2>
          {past.map((o) => (
            <div key={o.id} className="border-t border-neutral-200 pt-3 text-sm">
              <p className="font-semibold text-textStrong">
                {o.title}
                {o.targetProvinces.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-neutral-500">
                    {REGIONS.find((r) => REGION_PROVINCES[r].length === o.targetProvinces.length && REGION_PROVINCES[r].every((p) => o.targetProvinces.includes(p))) ?? o.targetProvinces.join(", ")}
                  </span>
                )}
              </p>
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
