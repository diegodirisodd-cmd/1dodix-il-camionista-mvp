import { redirect } from "next/navigation";

import { RequestsListClient } from "@/components/requests/requests-list-client";
import { getSessionUser } from "@/lib/auth";
export default async function TransporterJobsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <div className="card animate-fadeUp space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Richieste disponibili</p>
            <h1>Nuovi trasporti pronti da prendere in carico</h1>
            <p className="text-sm leading-relaxed text-neutral-600">
              Consulta le tratte pubblicate dalle aziende registrate. I contatti restano protetti finché non li sblocchi con la commissione.
            </p>
          </div>
        </div>
      </div>

      <RequestsListClient role={user.role} basePath="/dashboard/transporter/requests" variant="transporter" />
    </section>
  );
}
