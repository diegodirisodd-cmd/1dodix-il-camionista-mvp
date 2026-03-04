import { redirect } from "next/navigation";

import { RequestsListClient } from "@/components/requests/requests-list-client";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export default async function TransporterRequestsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser(user.role));
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-[#0f172a]">Richieste disponibili</h1>
        <p className="text-sm leading-relaxed text-[#475569]">
          Solo richieste reali, pubblicate da aziende registrate. I contatti sono protetti finché non li sblocchi.
        </p>
      </div>

      <RequestsListClient role={user.role} basePath="/app/transporter/requests" variant="transporter" />
    </section>
  );
}
