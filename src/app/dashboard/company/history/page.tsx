import { redirect } from "next/navigation";

import { CompanyHistoryList } from "@/components/requests/company-history-list";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CompanyHistoryPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const acceptedRequests = await prisma.request.findMany({
    where: { companyId: user.id, transporterId: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      price: true,
      createdAt: true,
      cargo: true,
      transporter: { select: { email: true } },
    },
  });

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Storico trasporti</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Richieste accettate dai trasportatori</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Qui trovi lo storico dei trasporti già accettati, con il contatto del trasportatore assegnato.
            </p>
          </div>
        </div>
      </div>

      <CompanyHistoryList
        requests={acceptedRequests.map((request) => ({
          ...request,
          createdAt: request.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
