import { SectionCard } from "@/components/dashboard/section-card";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const sentRequests = [
  {
    id: "REQ-2101",
    title: "Distribuzione pallet centro-nord",
    pickup: "Bergamo (BG)",
    dropoff: "Verona (VR)",
    budget: "€520",
    status: "In attesa",
    createdAt: "2024-01-12",
  },
  {
    id: "REQ-2102",
    title: "Trasporto urgente componenti industriali",
    pickup: "Brescia (BS)",
    dropoff: "Torino (TO)",
    budget: "€780",
    status: "Offerte ricevute",
    createdAt: "2024-01-15",
  },
  {
    id: "REQ-2103",
    title: "Linea settimanale alimentare fresco",
    pickup: "Reggio Emilia (RE)",
    dropoff: "Roma (RM)",
    budget: "€1.250",
    status: "Assegnato",
    createdAt: "2024-01-18",
  },
];

export default async function CompanyDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "COMPANY") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">Area riservata aziende</p>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard Azienda</h1>
        <p className="text-slate-700">
          Panoramica del profilo aziendale, richieste inviate e azioni rapide per pubblicare nuovi trasporti.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Profilo azienda">
          <dl className="space-y-2 text-sm text-slate-700">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Ruolo</dt>
              <dd className="font-medium text-slate-900">{user.role}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Iscritto</dt>
              <dd className="font-medium text-slate-900">
                {new Date(user.createdAt).toLocaleDateString("it-IT")}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Operatività"
          description="Metriche di esempio per la gestione delle richieste di trasporto."
          actions={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Demo</span>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Richieste attive</p>
              <p className="text-2xl font-semibold text-slate-900">{sentRequests.length}</p>
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Ultima pubblicazione</p>
              <p className="text-lg font-semibold text-slate-900">{sentRequests[0]?.createdAt}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Pubblica una richiesta"
          description="Crea una nuova spedizione e inviala ai trasportatori registrati."
          actions={
            <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
              Pubblica nuovo trasporto
            </button>
          }
        >
          <p>
            Questo bottone è un placeholder per l&apos;azione di pubblicazione: collega in seguito il flusso di creazione richiesta
            o un modulo dedicato.
          </p>
        </SectionCard>
      </section>

      <SectionCard
        title="Richieste inviate"
        description="Storico sintetico delle richieste di trasporto inviate ai trasportatori."
        actions={<span className="text-sm text-slate-500">{sentRequests.length} richieste</span>}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Titolo</th>
                <th className="px-4 py-3 font-semibold">Percorso</th>
                <th className="px-4 py-3 font-semibold">Budget</th>
                <th className="px-4 py-3 font-semibold">Stato</th>
                <th className="px-4 py-3 font-semibold">Pubblicata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sentRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{request.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.title}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                    {request.pickup} → {request.dropoff}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.budget}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{request.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
