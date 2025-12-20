import Link from "next/link";
import { redirect } from "next/navigation";

import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    // Protezione difensiva: il middleware dovrebbe già bloccare l'accesso.
    redirect("/login");
  }

  const isAdmin = user.role === "ADMIN";

  if (isAdmin) {
    redirect("/dashboard/admin");
  }

  const requestCtaLabel = user.role === "COMPANY" ? "Crea richiesta" : "Vedi richieste";
  const requestHref = user.role === "COMPANY" ? "/dashboard/company#pubblica" : "/dashboard/requests";
  const subscriptionCta = user.subscriptionActive ? "Gestisci abbonamento" : "Attiva abbonamento";

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Dashboard</p>
          <h1>Benvenuto in DodiX</h1>
          <p className="text-neutral-100/80">
            Qui trovi il controllo rapido su profilo, richieste e abbonamento. Usa le azioni veloci per iniziare subito.
          </p>
        </div>
        <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-200">Profilo</p>
          <p className="text-lg font-semibold text-white">Dati account</p>
          <p className="text-sm text-neutral-300">Email, ruolo e storicità in un unico posto.</p>
          <Link className="btn btn-secondary" href="/dashboard/profile">
            Gestisci profilo
          </Link>
        </div>

        <div className="card space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-200">Richieste</p>
          <p className="text-lg font-semibold text-white">Operatività</p>
          <p className="text-sm text-neutral-300">Pubblica incarichi se sei azienda o consulta quelli disponibili.</p>
          <Link className="btn btn-primary" href={requestHref}>
            {requestCtaLabel}
          </Link>
        </div>

        <div className="card space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-200">Abbonamento</p>
          <p className="text-lg font-semibold text-white">Accesso premium</p>
          <p className="text-sm text-neutral-300">Vedi lo stato e attiva subito se necessario.</p>
          <Link className="btn btn-secondary" href="/dashboard/subscription">
            {subscriptionCta}
          </Link>
        </div>
      </div>

      <div className="card space-y-3 text-sm text-neutral-100/80">
        <p className="text-base font-semibold text-white">Dati rapidi</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Ruolo</p>
            <p className="text-base font-semibold text-white">{user.role}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Creato il</p>
            <p className="text-base font-semibold text-white">{new Date(user.createdAt).toLocaleString("it-IT")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Stato abbonamento</p>
            <p className="text-base font-semibold text-white">{user.subscriptionActive ? "Attivo" : "Non attivo"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
