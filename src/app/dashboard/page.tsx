import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  redirect(routeForUser(user.role));
}
