import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export default async function AppIndexPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
}
