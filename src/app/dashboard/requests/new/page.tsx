import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export default async function NewRequestPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  redirect("/dashboard/company/new-request");
}
