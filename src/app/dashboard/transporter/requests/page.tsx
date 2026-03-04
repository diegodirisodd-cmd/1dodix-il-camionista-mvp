import { redirect } from "next/navigation";

export default function TransporterRequestsRedirectPage() {
  redirect("/dashboard/transporter/jobs");
}
