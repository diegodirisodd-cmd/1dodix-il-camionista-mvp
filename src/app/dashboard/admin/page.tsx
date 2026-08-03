import { redirect } from "next/navigation";

import { SectionCard } from "@/components/dashboard/section-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { StatusBadge, UrgencyBadge } from "@/components/services/service-badges";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { getSessionUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import {
  SERVICE_CATEGORY_LABELS,
  formatCents,
  type ServiceCategory,
  type ServiceRequestStatus,
  type UrgencyLevel,
} from "@/lib/service-categories";

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

type ServiceRequestSummary = {
  id: number;
  categoria: string;
  provincia: string;
  stato: string;
  urgenza: string;
  createdAt: Date;
  assignedQuoteId: number | null;
  transporter: { email: string; companyName: string | null };
  quotes: { priceCents: number }[];
};

type SupplierSummary = {
  id: number;
  ragioneSociale: string;
  partitaIva: string | null;
  createdAt: Date;
  user: { email: string };
  aree: { categoria: string; provincia: string }[];
  _count: { quotes: number; unlocks: number };
};

function formatRole(role: string) {
  if (role === "COMPANY") return "Azienda";
  if (role === "TRANSPORTER") return "Trasportatore";
  if (role === "SUPPLIER") return "Fornitore";
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
  let serviceRequests: ServiceRequestSummary[] = [];
  let suppliers: SupplierSummary[] = [];
  let loadError: string | null = null;

  try {
    [users, requests, serviceRequests, suppliers] = await Promise.all([
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
      prisma.serviceRequest.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          categoria: true,
          provincia: true,
          stato: true,
          urgenza: true,
          createdAt: true,
          assignedQuoteId: true,
          transporter: { select: { email: true, companyName: true } },
          quotes: { select: { priceCents: true } },
        },
      }),
      prisma.supplierProfile.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ragioneSociale: true,
          partitaIva: true,
          createdAt: true,
          user: { select: { email: true } },
          aree: { select: { categoria: true, provincia: true } },
          _count: { select: { quotes: true, unlocks: true } },
        },
      }),
    ]);
  } catch (error) {
    console.error("Errore caricamento dashboard admin", error);
    loadError = "Impossibile caricare i dati della dashboard.";
  }

  const companies = users.filter((u) => u.role === "COMPANY").length;
  const transporters = users.filter((u) => u.role === "TRANSPORTER").length;
  const supplierAccounts = users.filter((u) => u.role === "SUPPLIER").length;
  const openServiceRequests = serviceRequests.filter(
    (item) => item.stato === "APERTA" || item.stato === "IN_TRATTATIVA",
  ).length;

  return (
    <section className="space-y-6">
      <div className="card animate-fadeUp space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Controllo</p>
            <h1>Dashboard Admin</h1>
            <p className="max-w-2xl">
              Supervisione in sola lettura di utenti, trasporti e Borsa Servizi. Nessuna azione di
              modifica è abilitata in questo MVP.
            </p>
          </div>
          <SubscriptionBadge active={user.subscriptionActive} className="self-start" />
        </div>
      </div>

      {loadError && <p className="alert-warning">{loadError}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utenti totali" value={users.length} hint={`${companies} aziende · ${transporters} trasportatori`} />
        <StatCard label="Richieste di trasporto" value={requests.length} hint="Consultazione in sola lettura" />
        <StatCard label="Richieste Borsa Servizi" value={serviceRequests.length} hint={`${openServiceRequests} ancora in corso`} />
        <StatCard label="Fornitori registrati" value={suppliers.length} hint={`${supplierAccounts} account con ruolo fornitore`} />
      </div>

      <ScrollReveal>
        <SectionCard
          title="Richieste Borsa Servizi"
          description="Interventi richiesti dalle aziende di trasporto, con stato e preventivi ricevuti."
          className="space-y-4"
        >
          {serviceRequests.length === 0 ? (
            <p className="card-muted text-sm text-neutral-600">Nessuna richiesta di servizio pubblicata.</p>
          ) : (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Richiesta</th>
                    <th>Categoria</th>
                    <th>Zona</th>
                    <th>Stato</th>
                    <th>Preventivi</th>
                    <th>Trasportatore</th>
                    <th>Pubblicata</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map((item) => {
                    const best = item.quotes.reduce<number | null>(
                      (min, quote) => (min === null || quote.priceCents < min ? quote.priceCents : min),
                      null,
                    );

                    return (
                      <tr key={item.id}>
                        <td className="stat-mono font-semibold text-textStrong">#{item.id}</td>
                        <td>{SERVICE_CATEGORY_LABELS[item.categoria as ServiceCategory] ?? item.categoria}</td>
                        <td className="stat-mono">{item.provincia}</td>
                        <td>
                          <div className="flex flex-wrap gap-1.5">
                            <StatusBadge stato={item.stato as ServiceRequestStatus} />
                            <UrgencyBadge urgenza={item.urgenza as UrgencyLevel} />
                          </div>
                        </td>
                        <td>
                          <span className="stat-mono font-semibold text-textStrong">{item.quotes.length}</span>
                          {best !== null && <span className="stat-mono"> · da {formatCents(best)}</span>}
                        </td>
                        <td>{item.transporter.companyName ?? item.transporter.email}</td>
                        <td className="stat-mono">{new Date(item.createdAt).toLocaleDateString("it-IT")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </ScrollReveal>

      <ScrollReveal>
        <SectionCard
          title="Fornitori"
          description="Officine, telonai, gommisti e altri professionisti iscritti alla Borsa Servizi."
          className="space-y-4"
        >
          {suppliers.length === 0 ? (
            <p className="card-muted text-sm text-neutral-600">Nessun fornitore registrato.</p>
          ) : (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Ragione sociale</th>
                    <th>Email</th>
                    <th>Partita IVA</th>
                    <th>Coperture</th>
                    <th>Preventivi</th>
                    <th>Contatti sbloccati</th>
                    <th>Iscritto il</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => {
                    const categorie = Array.from(new Set(supplier.aree.map((area) => area.categoria)));

                    return (
                      <tr key={supplier.id}>
                        <td className="font-semibold text-textStrong">{supplier.ragioneSociale}</td>
                        <td>{supplier.user.email}</td>
                        <td className="stat-mono">{supplier.partitaIva ?? "—"}</td>
                        <td>
                          <span className="stat-mono font-semibold text-textStrong">{categorie.length}</span> categorie ·{" "}
                          <span className="stat-mono font-semibold text-textStrong">{supplier.aree.length}</span> zone
                        </td>
                        <td className="stat-mono">{supplier._count.quotes}</td>
                        <td className="stat-mono">{supplier._count.unlocks}</td>
                        <td className="stat-mono">{new Date(supplier.createdAt).toLocaleDateString("it-IT")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </ScrollReveal>

      <ScrollReveal>
        <SectionCard
          title="Utenti"
          description="Vista in sola lettura di aziende, trasportatori e fornitori registrati."
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
                    <td className="font-semibold text-textStrong">{item.email}</td>
                    <td>{formatRole(item.role)}</td>
                    <td className="stat-mono">{new Date(item.createdAt).toLocaleDateString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </ScrollReveal>

      <ScrollReveal>
        <SectionCard
          title="Richieste di trasporto"
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
                    <td className="stat-mono font-semibold text-textStrong">#{request.id}</td>
                    <td className="stat-mono">{formatCurrency(request.price)}</td>
                    <td>{request.company.email}</td>
                    <td className="stat-mono">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </ScrollReveal>
    </section>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="card card-hover space-y-1 p-4">
      <p className="table-meta">{label}</p>
      <p className="stat-mono text-3xl font-bold text-textStrong">{value}</p>
      <p className="text-xs text-neutral-500">{hint}</p>
    </div>
  );
}
