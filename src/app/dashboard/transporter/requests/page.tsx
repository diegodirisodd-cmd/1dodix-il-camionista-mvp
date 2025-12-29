import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export default async function TransporterRequestsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  redirect("/dashboard/transporter/jobs");
}
