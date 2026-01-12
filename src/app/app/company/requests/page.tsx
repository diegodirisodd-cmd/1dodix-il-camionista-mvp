import Link from "next/link";
import { redirect } from "next/navigation";

import { CompanyRequestsTable } from "@/components/dashboard/company-requests-table";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export default async function CompanyRequestsPage({
  searchParams,
}: {
  searchParams?: { created?: string };
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const requests = await prisma.request.findMany({
    where: { companyId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const showBanner = searchParams?.created === "1";

  return (
    <section className="space-y-6">
      {showBanner && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a] shadow-sm">
          Richiesta creata correttamente. Puoi gestirla da qui.
        </div>
      )}

      <div className="card space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Le tue richieste</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Storico completo delle spedizioni pubblicate dalla tua azienda.
            </p>
          </div>
          <Link href="/app/company/requests/new" className="btn-primary">
            Nuova richiesta
          </Link>
        </div>

        {requests.length === 0 ? (
          <p className="text-sm leading-relaxed text-[#475569]">Non hai ancora creato richieste.</p>
        ) : (
          <CompanyRequestsTable
            requests={requests.map((request) => ({
              id: request.id,
              priceCents: request.price,
              contactsUnlockedByCompany: request.contactsUnlockedByCompany,
              createdAt: request.createdAt.toISOString(),
            }))}
            role={user.role}
          />
        )}
      </div>
    </section>
  );
}
