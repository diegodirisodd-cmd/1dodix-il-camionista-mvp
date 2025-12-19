import { SectionCard } from "@/components/dashboard/section-card";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubscriptionBadge } from "@/components/subscription-badge";

function formatRole(role: string) {
  if (role === "COMPANY") return "Azienda";
  if (role === "TRANSPORTER") return "Trasportatore";
  return "Admin";
}

export default async function AdminDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.subscriptionActive) {
    redirect("/paywall");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, requests] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        operatingArea: true,
        phone: true,
        role: true,
        subscriptionActive: true,
        createdAt: true,
      },
    }),
    prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true, email: true } } },
    }),
  ]);

  const companies = users.filter((u) => u.role === "COMPANY").length;
  const transporters = users.filter((u) => u.role === "TRANSPORTER").length;
  const activeSubscriptions = users.filter((u) => u.subscriptionActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-400/50 bg-accent-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-100">
            Ruolo
            <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-bold uppercase text-brand-900">Admin</span>
          </div>
          <h1>Dashboard Admin</h1>
          <p className="text-neutral-100/80">
            Supervisione in sola lettura di utenti e richieste. Nessuna azione di modifica o moderazione è abilitata in questo MVP.
          </p>
        </div>
        <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Utenti totali</p>
          <p className="text-3xl font-semibold text-white">{users.length}</p>
          <p className="text-xs text-neutral-300">Tutti i profili registrati con ruoli attivi.</p>
          <div className="flex items-center gap-3 text-xs text-neutral-300">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 font-semibold text-neutral-100">
              Aziende
              <span className="text-white">{companies}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 font-semibold text-neutral-100">
              Trasportatori
              <span className="text-white">{transporters}</span>
            </span>
          </div>
        </div>
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Richieste totali</p>
          <p className="text-3xl font-semibold text-white">{requests.length}</p>
          <p className="text-xs text-neutral-300">Consultazione completa in sola lettura.</p>
        </div>
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Abbonamenti attivi</p>
          <p className="text-3xl font-semibold text-white">{activeSubscriptions}</p>
          <p className="text-xs text-neutral-300">Totale utenti con accesso sbloccato.</p>
        </div>
      </div>

      <SectionCard
        title="Utenti"
        description="Vista in sola lettura di aziende e trasportatori. Nessuna azione di modifica disponibile."
        className="space-y-4"
      >
        <div id="utenti" className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Nome / Azienda</th>
                <th>Ruolo</th>
                <th>Area operativa</th>
                <th>Abbonamento</th>
                <th>Creato il</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td className="space-y-1">
                    <div className="font-semibold text-white">{item.name || "Profilo"}</div>
                    <div className="text-xs text-neutral-300">{item.email}</div>
                    {item.phone ? <div className="text-xs text-neutral-300">{item.phone}</div> : null}
                  </td>
                  <td>
                    <span className="table-chip">{formatRole(item.role)}</span>
                  </td>
                  <td className="text-sm text-neutral-100/80">{item.operatingArea || "—"}</td>
                  <td>
                    <span className={`table-chip ${item.subscriptionActive ? "success" : "warning"}`}>
                      {item.subscriptionActive ? "Attivo" : "Non attivo"}
                    </span>
                  </td>
                  <td className="text-sm text-neutral-100/80">
                    {new Date(item.createdAt).toLocaleString("it-IT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Richieste"
        description="Elenco completo delle richieste pubblicate. I dettagli di contatto restano visibili solo in consultazione."
        className="space-y-4"
      >
        <div id="richieste" className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Rotta</th>
                <th>Finestra</th>
                <th>Carico</th>
                <th>Azienda</th>
                <th>Budget</th>
                <th>Creato il</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="font-semibold text-white">{request.pickup} → {request.dropoff}</div>
                    <div className="text-xs text-neutral-300">{request.title}</div>
                  </td>
                  <td className="text-sm text-neutral-100/80">{request.timeWindow || "—"}</td>
                  <td className="space-y-1 text-sm text-neutral-100/80">
                    <div className="font-semibold text-white">{request.cargoType}</div>
                    <div className="text-xs text-neutral-300">{request.estimatedWeight}</div>
                  </td>
                  <td className="space-y-1 text-sm text-neutral-100/80">
                    <div className="font-semibold text-white">{request.company.name || "Azienda"}</div>
                    <div className="text-xs text-neutral-300">{request.company.email}</div>
                  </td>
                  <td className="text-sm text-neutral-100/80">{request.budget || "—"}</td>
                  <td className="text-sm text-neutral-100/80">
                    {new Date(request.createdAt).toLocaleString("it-IT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
