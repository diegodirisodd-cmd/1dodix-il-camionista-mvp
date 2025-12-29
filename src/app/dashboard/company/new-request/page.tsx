import { redirect } from "next/navigation";

import { RequestForm } from "@/components/dashboard/request-form";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export default async function CompanyNewRequestPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  const isSubscribed = hasActiveSubscription(user);
  const requestCount = await prisma.request.count({
    where: { companyId: user.id },
  });
  const hasFreeQuota = requestCount === 0;
  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0f172a]">Crea richiesta</p>
            <h1 className="text-3xl font-semibold text-[#0f172a]">Crea una nuova richiesta di trasporto</h1>
            <p className="text-sm leading-relaxed text-[#475569]">
              Inserisci tratta, carico e referenti. La richiesta sarà visibile solo ai trasportatori registrati.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" role={user.role} />
        </div>
        <p className="text-xs text-[#64748b]">Nessun intermediario. Contatto diretto.</p>
      </div>

      <div className="card space-y-4">
        {!isSubscribed && (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-[#f5c76a] bg-[#fffaf2] p-4 text-sm text-[#475569]">
            <span className="mt-0.5 text-[#f5a524]">•</span>
            <div className="space-y-1">
              <p className="font-semibold text-[#0f172a]">La prima richiesta è inclusa</p>
              <p className="text-xs text-[#64748b]">Per le successive avrai bisogno del piano professionale.</p>
            </div>
          </div>
        )}
        <RequestForm
          role={user.role}
          subscriptionActive={isSubscribed}
          hasFreeQuota={hasFreeQuota}
          onSuccessRedirect="/dashboard/company/requests?created=1"
        />
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
          <span>Le richieste saranno visibili ai trasportatori registrati.</span>
          <span className="font-semibold text-[#475569]">Pagamenti sicuri con Stripe · Disdici quando vuoi</span>
        </div>
      </div>
    </section>
  );
}
