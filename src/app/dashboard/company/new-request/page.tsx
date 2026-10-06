import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RequestForm } from "@/components/dashboard/request-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Nuovo carico" };

export default async function CompanyNewRequestPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "COMPANY") redirect("/dashboard");

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Nuovo carico</p>
        <h1>Pubblica un carico</h1>
        <p className="text-sm text-neutral-600">
          Un minuto per compilarlo. Lo inviamo su WhatsApp ai trasportatori della zona; tu ricevi le candidature e scegli.
        </p>
      </div>
      <div className="card">
        <RequestForm onSuccessRedirect="/dashboard/company/requests" />
      </div>
    </section>
  );
}
