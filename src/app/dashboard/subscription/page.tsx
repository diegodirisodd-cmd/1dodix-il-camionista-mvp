import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export default async function SubscriptionPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "COMPANY") {
    redirect("/dashboard/company/billing");
  }

  if (user.role === "TRANSPORTER") {
    redirect("/dashboard/transporter/billing");
  }

  redirect("/dashboard/admin");
}
