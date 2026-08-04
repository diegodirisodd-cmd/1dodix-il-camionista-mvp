import { redirect } from "next/navigation";

import { OnboardingSteps } from "./onboarding-steps";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export default async function OnboardingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.onboardingCompleted) {
    redirect(routeForUser(user.role));
  }

  return (
    <section className="bg-road min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-4xl flex-col space-y-8">
        <div className="animate-fadeUp space-y-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Percorso guidato</p>
          <h1 className="text-white">Completa l&apos;onboarding</h1>
          <p className="max-w-3xl text-neutral-200/85">
            Dedica pochi secondi per capire come usare DodiX al meglio. Al termine verrai portato
            direttamente alla tua dashboard operativa.
          </p>
        </div>

        <OnboardingSteps role={user.role} />
      </div>
    </section>
  );
}
