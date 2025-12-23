import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export default async function TransporterProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a]">Profilo trasportatore</h1>
          <p className="text-sm leading-relaxed text-[#475569]">Questa è la tua area operativa.</p>
        </div>
        <SubscriptionBadge active={user.subscriptionActive} />
      </div>

      <div className="card space-y-3 text-sm text-[#0f172a]">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Email</p>
          <p className="text-[#475569]">{user.email}</p>
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
    </section>
  );
}
