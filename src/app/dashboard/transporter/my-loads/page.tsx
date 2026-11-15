import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PublishedLoads } from "@/components/loads/published-loads";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Carichi da affidare" };

export default async function TransporterMyLoadsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "TRANSPORTER") redirect("/dashboard");

  return (
    <PublishedLoads
      userId={user.id}
      detailBasePath="/dashboard/transporter/my-loads"
      newLoadHref="/dashboard/transporter/my-loads/new"
      eyebrow="Carichi da affidare"
      title="I carichi che hai pubblicato"
      intro="Hai un carico che non riesci a coprire o un mezzo già pieno? Pubblicalo: arriva su WhatsApp agli altri trasportatori della zona e scegli tu a chi affidarlo."
      emptyText="Non hai ancora pubblicato carichi. Pubblicare è gratis: paghi il 2% + IVA solo quando scegli il trasportatore."
    />
  );
}
