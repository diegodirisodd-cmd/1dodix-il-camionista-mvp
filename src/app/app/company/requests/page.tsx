import Link from "next/link";
import { redirect } from "next/navigation";

import { RequestsListClient } from "@/components/requests/requests-list-client";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

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
    redirect(routeForUser(user.role));
  }

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

        <RequestsListClient
          role={user.role}
          basePath="/app/company/requests"
          variant="company"
          emptyMessage="Non hai ancora creato richieste."
        />
      </div>
    </section>
  );
}
