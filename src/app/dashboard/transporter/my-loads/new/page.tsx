import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RequestForm } from "@/components/dashboard/request-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Affida un carico" };

export default async function TransporterNewLoadPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "TRANSPORTER") redirect("/dashboard");

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Affida un carico</p>
        <h1>Pubblica un carico che non riesci a coprire</h1>
        <p className="text-sm text-neutral-600">
          Lo inviamo su WhatsApp agli altri trasportatori della zona. Ricevi le candidature, scegli tu e paghi il 2% + IVA
          solo quando scegli.
        </p>
      </div>
      <div className="card">
        <RequestForm detailBasePath="/dashboard/transporter/my-loads" requireSubcontractDeclaration />
      </div>
    </section>
  );
}
