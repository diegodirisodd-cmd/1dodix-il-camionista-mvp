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
      <div className="card animate-fadeUp space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Crea richiesta</p>
            <h1>Crea una nuova richiesta di trasporto</h1>
            <p className="text-sm leading-relaxed text-neutral-600">
              Inserisci tratta, carico e referenti. La richiesta sarà visibile solo ai trasportatori registrati.
            </p>
          </div>
          <SubscriptionBadge active={isSubscribed} className="self-start" role={user.role} />
        </div>
        <p className="text-xs text-neutral-500">Nessun intermediario. Contatto diretto.</p>
      </div>

      <div className="card space-y-4">
        {!isSubscribed && (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-accent-200 bg-accent-50/60 p-4 text-sm text-neutral-600">
            <span className="mt-0.5 text-accent-500">•</span>
            <div className="space-y-1">
              <p className="font-semibold text-textStrong">La prima richiesta è inclusa</p>
              <p className="text-xs text-neutral-500">Per le successive potrai sbloccare i contatti con la commissione 2%.</p>
            </div>
          </div>
        )}
        <RequestForm
          role={user.role}
          subscriptionActive={isSubscribed}
          hasFreeQuota={hasFreeQuota}
          onSuccessRedirect="/dashboard/company/requests?created=1"
        />
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <span>Le richieste saranno visibili ai trasportatori registrati.</span>
          <span className="font-semibold text-neutral-600">Commissione applicata solo quando sblocchi i contatti.</span>
        </div>
      </div>
    </section>
  );
}
