import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ServiceRequestDetail } from "@/components/services/service-request-detail";
import { SkeletonCard } from "@/components/skeleton";
import { getSessionUser } from "@/lib/auth";
import { type Role } from "@/lib/roles";

export default async function ServiceRequestDetailPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER" && user.role !== "SUPPLIER" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const requestId = Number(params.id);

  if (!Number.isFinite(requestId)) {
    redirect("/dashboard/services");
  }

  return (
    <Suspense fallback={<SkeletonCard />}>
      <ServiceRequestDetail requestId={requestId} role={user.role as Role} userId={user.id} />
    </Suspense>
  );
}
