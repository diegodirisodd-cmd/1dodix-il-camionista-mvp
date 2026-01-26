import { RequestDetailPage } from "@/components/requests/request-detail-page";

export default async function TransporterRequestDetailPage({ params }: { params: { id: string } }) {
  return <RequestDetailPage requestId={Number(params.id)} backHref="/app/transporter/requests" />;
}
