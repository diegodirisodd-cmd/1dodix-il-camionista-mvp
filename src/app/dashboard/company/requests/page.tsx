import type { Request as RequestModel } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CompanyRequestsTable } from "@/components/dashboard/company-requests-table";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CompanyRequestsPage({ searchParams }: { searchParams?: { created?: string } }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const showCreated = searchParams?.created === "1";
  let companyRequests: RequestModel[] = [];
  let loadError: string | null = null;

  try {
    companyRequests = await prisma.request.findMany({
      where: { companyId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Errore caricamento richieste azienda", error);
    loadError = "Impossibile caricare le richieste. Riprova tra poco.";
  }

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

      {loadError ? (
        <p className="alert-warning">{loadError}</p>
      ) : companyRequests.length === 0 ? (
        <div className="card text-sm leading-relaxed text-[#475569]">
          Nessuna richiesta presente. Pubblica la prima per ricevere contatti diretti.
        </div>
      ) : (
        <CompanyRequestsTable
          requests={companyRequests.map((request) => ({
            id: request.id,
            priceCents: request.price,
            contactsUnlockedByCompany: request.contactsUnlockedByCompany,
            createdAt: request.createdAt.toISOString(),
          }))}
          role={user.role}
          basePath="/dashboard/company/requests"
        />
      )}
    </section>
  );
}
