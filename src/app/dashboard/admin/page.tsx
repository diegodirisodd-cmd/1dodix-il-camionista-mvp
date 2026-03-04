import { SectionCard } from "@/components/dashboard/section-card";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type UserSummary = {
  id: number;
  email: string;
  role: string;
  createdAt: Date;
};

type RequestSummary = {
  id: number;
  price: number;
  createdAt: Date;
  company: { email: string; role: string };
};

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

  let users: UserSummary[] = [];
  let requests: RequestSummary[] = [];
  let loadError: string | null = null;

  try {
    [users, requests] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.request.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          price: true,
          createdAt: true,
          company: { select: { email: true, role: true } },
        },
      }),
    ]);
  } catch (error) {
    console.error("Errore caricamento dashboard admin", error);
    loadError = "Impossibile caricare i dati della dashboard.";
  }

  const companies = users.filter((u) => u.role === "COMPANY").length;
  const transporters = users.filter((u) => u.role === "TRANSPORTER").length;

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard Admin</h1>
            <p className="text-sm leading-relaxed text-slate-700">
              Supervisione in sola lettura di utenti e richieste. Nessuna azione di modifica è abilitata in questo MVP.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
      </div>

      {loadError && <p className="alert-warning">{loadError}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Utenti totali</p>
          <p className="text-3xl font-semibold text-slate-900">{users.length}</p>
          <p className="text-sm leading-relaxed text-slate-700">Tutti i profili registrati con ruoli attivi.</p>
        </div>
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Richieste totali</p>
          <p className="text-3xl font-semibold text-slate-900">{requests.length}</p>
          <p className="text-sm leading-relaxed text-slate-700">Consultazione completa in sola lettura.</p>
        </div>
        <div className="card space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Distribuzione</p>
          <p className="text-sm leading-relaxed text-slate-800">Aziende: {companies} · Trasportatori: {transporters}</p>
          <p className="text-sm leading-relaxed text-slate-700">Panoramica rapida del network attivo.</p>
        </div>
      </div>

      <SectionCard
        title="Utenti"
        description="Vista in sola lettura di aziende e trasportatori registrati."
        className="space-y-4"
      >
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Ruolo</th>
                <th>Creato il</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold text-slate-900">{item.email}</td>
                  <td className="text-slate-800">{formatRole(item.role)}</td>
                  <td className="text-slate-800">{new Date(item.createdAt).toLocaleDateString("it-IT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Richieste"
        description="Elenco completo delle richieste pubblicate dalle aziende."
        className="space-y-4"
      >
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Richiesta</th>
                <th>Valore</th>
                <th>Azienda</th>
                <th>Pubblicata</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="font-semibold text-slate-900">Richiesta #{request.id}</td>
                  <td className="text-slate-800">{formatCurrency(request.price)}</td>
                  <td className="text-slate-800">{request.company.email}</td>
                  <td className="text-slate-800">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </section>
  );
}
