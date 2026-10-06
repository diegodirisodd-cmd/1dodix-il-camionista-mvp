import { redirect } from "next/navigation";

// Lo storico ora e' nella lista unica dei carichi (sezione "Conclusi").
export default function CompanyHistoryRedirect() {
  redirect("/dashboard/company/requests");
}
