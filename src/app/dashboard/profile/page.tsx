import { Suspense } from "react";
import { redirect } from "next/navigation";

import { PhoneForm } from "@/components/profile/phone-form";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { LogoutButton } from "@/components/logout-button";
import { getSessionUser } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const subscriptionActive = hasActiveSubscription(user);

  return (
    <section className="space-y-6">
      <div className="card animate-fadeUp space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-600">Profilo</p>
            <h1>Dettagli account</h1>
            <p className="text-sm leading-relaxed text-neutral-600">
              Accesso verificato per {user.email}. Gestisci le tue informazioni principali da questa sezione.
            </p>
          </div>
          <SubscriptionBadge
            active={subscriptionActive}
            className="self-start"
            icon={subscriptionActive ? "lightning" : "check"}
            role={user.role as any}
          />
        </div>
      </div>

      <div className="card space-y-6 text-sm text-neutral-600">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Ruolo</p>
            <p className="text-base font-semibold text-textStrong">{user.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Telefono</p>
            <p className="text-base font-semibold text-textStrong">{user.phone ?? "Telefono non disponibile"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Creato il</p>
            <p className="text-base font-semibold text-textStrong">{new Date(user.createdAt).toLocaleString("it-IT")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Commissione contatti</p>
            <p className="text-base font-semibold text-textStrong">{subscriptionActive ? "Accesso completo attivo" : "Paghi solo quando sblocchi"}</p>
          </div>
        </div>

        {user.role === "TRANSPORTER" && (
          <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Aggiorna telefono</p>
              <p className="text-sm text-neutral-600">Il numero sarà mostrato alle aziende dopo l&apos;assegnazione.</p>
            </div>
            <PhoneForm initialPhone={user.phone} />
          </div>
        )}

        <div className="pt-2">
          <Suspense fallback={<p>Chiusura sessione...</p>}>
            <LogoutButton />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
