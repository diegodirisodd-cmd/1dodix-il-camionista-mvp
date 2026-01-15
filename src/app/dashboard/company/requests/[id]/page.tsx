import { RequestDetailPage } from "@/components/requests/request-detail-page";

export default async function DashboardCompanyRequestDetailPage({ params }: { params: { id: string } }) {
  return <RequestDetailPage requestId={Number(params.id)} backHref="/dashboard/company/requests" />;
}
