import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PublishedLoads } from "@/components/loads/published-loads";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "I miei carichi" };

export default async function CompanyRequestsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "COMPANY") redirect("/dashboard");

  return (
    <PublishedLoads
      userId={user.id}
      detailBasePath="/dashboard/company/requests"
      newLoadHref="/dashboard/company/new-request"
      eyebrow="I miei carichi"
      title="Carichi pubblicati"
      emptyText="Pubblicare è gratis: il carico arriva su WhatsApp ai trasportatori della zona."
    />
  );
}
