import { redirect } from "next/navigation";

import { AcceptedTransportsList } from "@/components/requests/accepted-transports-list";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TransporterAcceptedPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  const acceptedRequests = await prisma.request.findMany({
    where: { transporterId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      pickup: true,
      delivery: true,
      price: true,
      createdAt: true,
      status: true,
      company: { select: { email: true } },
    },
  });

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Trasporti accettati</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Le tue richieste già prese in carico</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Qui trovi l&apos;elenco delle tratte che hai accettato, con lo stato sempre aggiornato.
            </p>
          </div>
        </div>
      </div>

      <AcceptedTransportsList
        requests={acceptedRequests.map((request) => ({
          ...request,
          createdAt: request.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
