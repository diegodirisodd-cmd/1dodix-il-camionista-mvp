import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { billingDestinationForRole } from "@/lib/subscription";
import { routeForUser } from "@/lib/navigation";

export default async function BillingRedirectPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  redirect(billingDestinationForRole(user.role) ?? routeForUser(user.role));
}
