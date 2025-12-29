import { redirect } from "next/navigation";
import type { Request as RequestModel } from "@prisma/client";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { TransporterJobsTable } from "@/components/dashboard/transporter/jobs-table";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscription";

type RequestWithCompany = RequestModel & { company: { email: string } };

function maskContact(subscriptionActive: boolean, request: RequestWithCompany) {
  if (subscriptionActive) return request;

  const { contactName, contactPhone, contactEmail, ...rest } = request;
  return {
    ...rest,
    contactName: contactName ? "Referente nascosto" : null,
    contactPhone: contactPhone ? "••••••" : null,
    contactEmail: contactEmail ? "••••@••••" : null,
  };
}

export default async function TransporterJobsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  const requests: RequestWithCompany[] = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { email: true } } },
  });

  const subscriptionActive = hasActiveSubscription(user);
  const displayRequests = requests.map((request) => maskContact(subscriptionActive, request));

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Richieste disponibili</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Nuovi trasporti pronti da prendere in carico</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Consulta le tratte pubblicate dalle aziende registrate. I contatti restano protetti finché il piano professionale non è attivo.
            </p>
          </div>
          <SubscriptionBadge active={subscriptionActive} className="self-start" role={user.role} />
        </div>
      </div>

      <TransporterJobsTable
        requests={displayRequests.map((request) => ({
          ...request,
          createdAt: request.createdAt.toISOString(),
        }))}
        subscriptionActive={subscriptionActive}
        role={user.role}
      />
    </section>
  );
}
