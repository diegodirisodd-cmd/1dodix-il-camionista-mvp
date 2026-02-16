import { RequestDetailPage } from "@/components/requests/request-detail-page";

export default async function CompanyRequestDetailPage({ params }: { params: { id: string } }) {
  return <RequestDetailPage requestId={Number(params.id)} backHref="/app/company/requests" />;
}
