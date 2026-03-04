import { RequestDetailPage } from "@/components/requests/request-detail-page";

export default async function DashboardTransporterRequestDetailPage({ params }: { params: { id: string } }) {
  return <RequestDetailPage requestId={Number(params.id)} backHref="/dashboard/transporter/requests" />;
}
