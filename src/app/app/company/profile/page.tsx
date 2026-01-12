import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export default async function CompanyProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#0f172a]">Profilo aziendale</h1>
        <p className="text-sm leading-relaxed text-[#475569]">
          Mantieni aggiornati i dati di contatto e le informazioni di base per favorire risposte rapide dai trasportatori.
        </p>
      </div>

      <div className="card space-y-3 text-sm text-[#0f172a]">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Email</p>
          <p className="text-[#475569]">{user.email}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Ruolo</p>
          <p className="text-[#475569]">{user.role}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Iscrizione</p>
          <p className="text-[#475569]">{new Date(user.createdAt).toLocaleDateString("it-IT")}</p>
        </div>
      </div>
    </section>
  );
}
