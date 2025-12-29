import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export default async function RequestsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "COMPANY") {
    redirect("/dashboard/company/requests");
  }

  if (user.role === "TRANSPORTER") {
    redirect("/dashboard/transporter/requests");
  }

  redirect("/dashboard/admin");
}
