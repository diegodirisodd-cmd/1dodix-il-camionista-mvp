import Link from "next/link";
import { redirect } from "next/navigation";

import { ServicesBoard } from "@/components/services/services-board";
import { getSessionUser } from "@/lib/auth";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_VALUES } from "@/lib/service-categories";
import { type Role } from "@/lib/roles";

export default async function ServicesBoardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER" && user.role !== "SUPPLIER") {
    redirect("/dashboard");
  }

  const isTransporter = user.role === "TRANSPORTER";

  return (
    <section className="space-y-6">
      <div className="card animate-fadeUp space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Borsa Servizi</p>
            <h1>
              {isTransporter ? "Servizi per il tuo mezzo, in tempi rapidi" : "Richieste compatibili con i tuoi servizi"}
            </h1>
            <p className="max-w-2xl">
              {isTransporter
                ? "Pubblica una richiesta di intervento e ricevi preventivi da officine, telonai, gommisti e soccorso stradale della zona in cui ti trovi."
                : "Qui trovi le richieste aperte che rientrano nelle categorie e nelle province che copri. Invia un preventivo e sblocca il contatto quando il trasportatore ti interessa."}
            </p>
          </div>
          {isTransporter && (
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

      <ServicesBoard role={user.role as Role} />
    </section>
  );
}
