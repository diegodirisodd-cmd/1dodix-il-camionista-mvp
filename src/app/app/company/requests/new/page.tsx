import { redirect } from "next/navigation";

import { RequestForm } from "@/components/dashboard/request-form";
import { getSessionUser } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { routeForUser } from "@/lib/navigation";

export default async function NewCompanyRequestPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const subscriptionActive = hasActiveSubscription(user);
  const requestCount = await prisma.request.count({ where: { companyId: user.id } });
  const hasFreeQuota = requestCount === 0;

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Nuova richiesta</p>
        <h1 className="text-3xl font-semibold text-[#0f172a]">Crea una nuova richiesta di trasporto</h1>
        <p className="text-sm leading-relaxed text-[#475569]">
          Inserisci i dettagli per ricevere contatti da trasportatori compatibili. Le richieste sono visibili solo a operatori registrati.
        </p>
      </div>

      <div className="card">
        {!subscriptionActive && (
          <div className="mb-3 rounded-lg border border-dashed border-[#f5c76a] bg-[#fffaf2] p-3 text-xs font-medium text-[#475569]">
            <p className="text-[#0f172a]">La prima richiesta è inclusa. Per le successive serve il piano professionale.</p>
            <p className="text-[#64748b]">Nessuna intermediazione, contatti diretti.</p>
          </div>
        )}
        <RequestForm
          role={user.role}
          subscriptionActive={subscriptionActive}
          hasFreeQuota={hasFreeQuota}
          onSuccessRedirect="/app/company/requests?created=1"
        />
        <p className="mt-3 text-xs text-[#64748b]">Le richieste sono visibili solo a trasportatori registrati.</p>
      </div>
    </section>
  );
}
