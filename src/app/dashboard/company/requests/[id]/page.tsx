import { redirect } from "next/navigation";

import { RequestDetailPage } from "@/components/requests/request-detail-page";
import { getSessionUser } from "@/lib/auth";

export default async function DashboardCompanyRequestDetailPage({ params }: { params: { id: string } }) {
  // Avvisi email/WhatsApp e ritorno da Stripe puntano qui per chi ha
  // pubblicato il carico: un trasportatore lo gestisce dalla sua area.
  const user = await getSessionUser();
  if (user?.role === "TRANSPORTER") redirect(`/dashboard/transporter/my-loads/${params.id}`);
  return <RequestDetailPage requestId={Number(params.id)} backHref="/dashboard/company/requests" />;
}
