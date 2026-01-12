import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

    return (
      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Impostazioni</p>
          <h1>Preferenze account</h1>
          <p className="text-sm leading-relaxed text-[#475569]">Area dedicata per configurazioni generali. Altre opzioni arriveranno nelle prossime iterazioni.</p>
        </div>

        <div className="card text-sm text-[#475569]">
          <p className="leading-relaxed text-[#475569]">Non ci sono ancora impostazioni modificabili. Continua a usare il profilo e le richieste dalle sezioni dedicate.</p>
        </div>
      </section>
    );
  }
