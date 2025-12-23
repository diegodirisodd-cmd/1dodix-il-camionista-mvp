import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export default async function TransporterRequestsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const requests = await prisma.request.findMany({ orderBy: { createdAt: "desc" } });
  const canViewContacts = user.subscriptionActive;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a]">Richieste disponibili</h1>
          <p className="text-sm leading-relaxed text-[#475569]">
            Solo richieste reali, pubblicate da aziende registrate. I contatti sono visibili con abbonamento attivo.
          </p>
        </div>
        {!canViewContacts && (
          <a
            href="https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Attiva abbonamento per vedere i contatti
          </a>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((request) => (
          <div key={request.id} className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#0f172a]">{request.title}</p>
            <p className="mt-2 text-sm text-[#475569]">
              {request.pickup} → {request.dropoff}
            </p>
            <p className="mt-1 text-xs text-[#64748b]">Pubblicata il {new Date(request.createdAt).toLocaleDateString("it-IT")}</p>
            <div className="mt-3 space-y-1 text-sm text-[#475569]">
              <p className="font-semibold text-[#0f172a]">Dettagli carico</p>
              <p>{request.cargo || "Carico non specificato"}</p>
              <p className="text-xs text-[#64748b]">Budget: {request.budget || "—"}</p>
            </div>
            <div className="mt-4 space-y-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm">
              <p className="font-semibold text-[#0f172a]">Contatti azienda</p>
              {canViewContacts ? (
                <>
                  <p className="text-[#475569]">{request.contactName}</p>
                  <p className="text-[#475569]">{request.contactEmail}</p>
                  <p className="text-[#475569]">{request.contactPhone}</p>
                </>
              ) : (
                <>
                  <p className="text-[#475569]">Contatti bloccati</p>
                  <p className="text-xs text-[#64748b]">Attiva l’abbonamento per vedere email e telefono.</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
