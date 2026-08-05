import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ServiceRequestDetail } from "@/components/services/service-request-detail";
import { SkeletonCard } from "@/components/skeleton";
import { getSessionUser } from "@/lib/auth";
import { canRequestServices, type Role } from "@/lib/roles";

// Titolo dinamico: il numero della richiesta e' l'unica cosa che distingue
// una scheda dall'altra fra piu' tab aperte.
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const id = Number(params.id);
  return {
    title: Number.isFinite(id) ? `Richiesta #${id}` : "Richiesta di servizio",
    description:
      "Dettaglio della richiesta di servizio: preventivi ricevuti, assegnazione dell'intervento e stato di avanzamento.",
  };
}

export default async function ServiceRequestDetailPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!canRequestServices(user.role) && user.role !== "SUPPLIER" && user.role !== "ADMIN") {
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
