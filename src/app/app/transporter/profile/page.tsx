import { redirect } from "next/navigation";

import { PhoneForm } from "@/components/profile/phone-form";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function TransporterProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const subscriptionActive = hasActiveSubscription(user);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a]">Profilo trasportatore</h1>
          <p className="text-sm leading-relaxed text-[#475569]">Questa è la tua area operativa.</p>
        </div>
        <SubscriptionBadge active={subscriptionActive} role={user.role} />
      </div>

      <div className="card space-y-3 text-sm text-[#0f172a]">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Email</p>
          <p className="text-[#475569]">{user.email}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Telefono</p>
          <p className="text-[#475569]">{user.phone ?? "Telefono non disponibile"}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Ruolo</p>
          <p className="text-[#475569]">{user.role}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Iscrizione</p>
          <p className="text-[#475569]">{new Date(user.createdAt).toLocaleDateString("it-IT")}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Onboarding</p>
          <p className="text-[#475569]">{user.onboardingCompleted ? "Completo" : "In corso"}</p>
        </div>
      </div>

      <div className="card space-y-3 text-sm text-[#0f172a]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#475569]">Aggiorna telefono</p>
          <p className="text-sm text-[#475569]">Inserisci un numero valido per essere ricontattato dalle aziende.</p>
        </div>
        <PhoneForm initialPhone={user.phone} />
      </div>
    </section>
  );
}
