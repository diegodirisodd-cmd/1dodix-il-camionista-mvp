import { redirect } from "next/navigation";

import { TransporterJobsTable } from "@/components/dashboard/transporter/jobs-table";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export default async function TransporterRequestsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const requests = await prisma.request.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-[#0f172a]">Richieste disponibili</h1>
        <p className="text-sm leading-relaxed text-[#475569]">
          Solo richieste reali, pubblicate da aziende registrate. I contatti sono protetti finché non li sblocchi.
        </p>
      </div>

      <TransporterJobsTable
        requests={requests.map((request) => ({
          id: request.id,
          price: request.price.toString(),
          contactsUnlockedByTransporter: request.contactsUnlockedByTransporter,
          createdAt: request.createdAt.toISOString(),
        }))}
        role={user.role}
      />
    </section>
  );
}
