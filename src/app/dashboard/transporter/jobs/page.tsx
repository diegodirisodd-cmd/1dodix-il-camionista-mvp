import { redirect } from "next/navigation";

export default function TransporterJobsRedirectPage() {
  redirect("/dashboard/transporter/requests");
}
