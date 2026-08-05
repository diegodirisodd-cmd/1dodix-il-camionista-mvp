import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ServicesBoard } from "@/components/services/services-board";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_VALUES } from "@/lib/service-categories";
import { canRequestServices, type Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Borsa Servizi",
  description:
    "Richieste di intervento al mezzo: officine, telonai, gommisti, soccorso stradale, carrozzerie e lavaggio. Pubblicare è gratuito.",
};

export default async function ServicesBoardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const isRequester = canRequestServices(user.role);

  if (!isRequester && user.role !== "SUPPLIER") {
    redirect("/dashboard");
  }

  // Serve a distinguere i due stati vuoti del fornitore: profilo da compilare
  // oppure profilo a posto ma nessuna richiesta aperta compatibile.
  const supplierHasAreas =
    user.role === "SUPPLIER"
      ? (await prisma.supplierServiceArea.count({
          where: { supplier: { userId: user.id } },
        })) > 0
      : false;

  return (
    <section className="space-y-6">
      <div className="card animate-fadeUp space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Borsa Servizi</p>
            <h1>
              {isRequester ? "Servizi per i tuoi mezzi, in tempi rapidi" : "Richieste compatibili con i tuoi servizi"}
            </h1>
            <p className="max-w-2xl">
              {isRequester
                ? "Pubblica una richiesta di intervento e ricevi preventivi da officine, telonai, gommisti e soccorso stradale della zona in cui si trova il mezzo."
                : "Qui trovi le richieste aperte che rientrano nelle categorie e nelle province che copri. Invia un preventivo e sblocca il contatto quando il cliente ti interessa."}
            </p>
          </div>
          {isRequester && (
            <Link href="/dashboard/services/new" className="btn-primary min-h-[44px] shrink-0">
              Cerco un servizio
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {SERVICE_CATEGORY_VALUES.map((categoria) => (
            <span key={categoria} className="table-chip">
              {SERVICE_CATEGORY_LABELS[categoria]}
            </span>
          ))}
        </div>
      </div>

      <ServicesBoard role={user.role as Role} supplierHasAreas={supplierHasAreas} />
    </section>
  );
}
