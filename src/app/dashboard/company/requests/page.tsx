import Link from "next/link";
import { redirect } from "next/navigation";

import { RequestsListClient } from "@/components/requests/requests-list-client";
import { getSessionUser } from "@/lib/auth";

export default async function CompanyRequestsPage({ searchParams }: { searchParams?: { created?: string } }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const showCreated = searchParams?.created === "1";

  return (
    <section className="space-y-6">
      {showCreated && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
          Richiesta creata correttamente. Gestiscila dall&apos;elenco qui sotto.
        </div>
      )}

      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Richieste inviate</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Pubblica, monitora e aggiorna le spedizioni</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Tutte le tue richieste di trasporto in un unico posto, pronte per contattare trasportatori verificati.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/company/new-request"
            className="btn btn-primary"
          >
            Pubblica una nuova spedizione
          </Link>
          <p className="text-xs text-[#64748b]">Le richieste sono visibili solo a trasportatori registrati.</p>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff8ed] px-3 py-1 text-[11px] font-semibold text-[#92400e] ring-1 ring-[#f5c76a]">
            Commissione 2% – una tantum
          </div>
        </div>
      </div>

      <RequestsListClient
        role={user.role}
        basePath="/dashboard/company/requests"
        variant="company"
        emptyMessage="Nessuna richiesta presente. Pubblica la prima per ricevere contatti diretti."
      />
    </section>
  );
}
