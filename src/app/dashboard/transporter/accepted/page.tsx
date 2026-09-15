import { redirect } from "next/navigation";

import { AcceptedTransportsList } from "@/components/requests/accepted-transports-list";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redactRequestContacts } from "@/lib/request-privacy";
import { type Role } from "@/lib/roles";
import { getUnlockStatesForRequests } from "@/lib/unlocks";

export default async function TransporterAcceptedPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "TRANSPORTER") {
    redirect("/dashboard");
  }

  const acceptedRequests = await prisma.request.findMany({
    where: { transporterId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      cargo: true,
      price: true,
      createdAt: true,
      companyId: true,
      company: { select: { email: true } },
    },
  });

  // Accettare una tratta non paga la commissione: l'email dell'azienda resta
  // nascosta finche' il trasportatore non ha sbloccato quella richiesta.
  const unlockStates = await getUnlockStatesForRequests(
    acceptedRequests.map((request) => request.id),
    user.id,
    user.role as Role,
  );

  return (
    <section className="space-y-6">
      <div className="card animate-fadeUp space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Trasporti accettati</p>
            <h1>Le tue richieste già prese in carico</h1>
            <p className="text-sm leading-relaxed text-neutral-600">
              Qui trovi l&apos;elenco delle tratte che hai accettato, con lo stato sempre aggiornato.
            </p>
          </div>
        </div>
      </div>

      <AcceptedTransportsList
        requests={acceptedRequests.map((request) => {
          const unlockedForCurrentUser =
            unlockStates.get(request.id)?.unlockedByMe ?? false;
          const safe = redactRequestContacts(
            request,
            { id: user.id, role: user.role },
            unlockedForCurrentUser,
          );
          return {
            ...safe,
            createdAt: request.createdAt.toISOString(),
          };
        })}
      />
    </section>
  );
}
