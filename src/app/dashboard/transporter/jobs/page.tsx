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
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Richieste disponibili</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Nuovi trasporti pronti da prendere in carico</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Consulta le tratte pubblicate dalle aziende registrate. I contatti restano protetti finché non li sblocchi con la commissione.
            </p>
          </div>
        </div>
      </div>

      <RequestsListClient role={user.role} basePath="/dashboard/transporter/requests" variant="transporter" />
    </section>
  );
}
