import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppFrame } from "@/components/app/app-frame";
import { getSessionUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <AppFrame user={{ ...user, role: user.role as any }}>{children}</AppFrame>;
}
