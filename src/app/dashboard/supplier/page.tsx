import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ScrollReveal } from "@/components/scroll-reveal";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SERVICE_CATEGORY_LABELS,
  formatCents,
  getServiceUnlockTotalCents,
  type ServiceCategory,
} from "@/lib/service-categories";

export const metadata: Metadata = {
  title: "Area fornitore",
  description:
    "Le tue coperture, i preventivi inviati e i lavori assegnati sulla Borsa Servizi DodiX.",
};

export default async function SupplierDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "SUPPLIER") {
    redirect("/dashboard");
  }

  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: user.id },
    include: { aree: true },
  });

  const categorie = Array.from(new Set(profile?.aree.map((area) => area.categoria) ?? []));
  const province = Array.from(new Set(profile?.aree.map((area) => area.provincia) ?? []));

  const [matchingOpen, quotesSent, assignedQuotes, unlocks] = profile
    ? await Promise.all([
        categorie.length > 0 && province.length > 0
          ? prisma.serviceRequest.count({
              where: { stato: "APERTA", categoria: { in: categorie }, provincia: { in: province } },
            })
          : Promise.resolve(0),
        prisma.serviceQuote.count({ where: { supplierId: profile.id } }),
        prisma.serviceRequest.count({
          where: { stato: { in: ["ASSEGNATA", "CONCLUSA"] }, quotes: { some: { supplierId: profile.id } } },
        }),
        prisma.serviceContactUnlock.count({ where: { supplierId: profile.id } }),
      ])
    : [0, 0, 0, 0];

  const profileComplete = Boolean(profile && profile.aree.length > 0);

  return (
    <section className="space-y-6">
      <div className="card-contrast bg-road animate-fadeUp space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Borsa Servizi</p>
        <h1 className="text-white">
          {profile?.ragioneSociale ? `Ciao, ${profile.ragioneSociale}` : "Benvenuto tra i fornitori DodiX"}
        </h1>
        <p className="max-w-2xl text-neutral-200/90">
          Ricevi richieste di intervento dalle aziende della tua zona, invii un preventivo
          gratuito e paghi solo se vuoi il contatto diretto del cliente.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/dashboard/services" className="btn-primary min-h-[44px]">
            Vedi richieste compatibili
          </Link>
          <Link
            href="/dashboard/supplier/profile"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/10"
          >
            Gestisci servizi e zone
          </Link>
        </div>
      </div>

      {!profileComplete && (
        <div className="alert-warning">
          <span>
            Completa il profilo indicando i servizi che offri e le province in cui intervieni: senza
            queste informazioni non ricevi alcuna richiesta.{" "}
            <Link href="/dashboard/supplier/profile" className="font-semibold underline">
              Completa ora
            </Link>
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Richieste aperte compatibili" value={matchingOpen} />
        <StatCard label="Preventivi inviati" value={quotesSent} />
        <StatCard label="Lavori assegnati" value={assignedQuotes} />
        <StatCard label="Contatti sbloccati" value={unlocks} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <ScrollReveal>
          <div className="card space-y-4">
            <div className="space-y-1">
              <h2>Le tue coperture</h2>
              <p>Categorie e province su cui ricevi notifiche di nuove richieste.</p>
            </div>

            {profile && profile.aree.length > 0 ? (
              <div className="space-y-4">
                {categorie.map((categoria) => {
                  const provinceCategoria = profile.aree
                    .filter((area) => area.categoria === categoria)
                    .map((area) => area.provincia)
                    .sort();

                  return (
                    <div key={categoria} className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm">
                          {SERVICE_CATEGORY_LABELS[categoria as ServiceCategory] ?? categoria}
                        </h3>
                        <span className="table-meta">
                          <span className="stat-mono text-textStrong">{provinceCategoria.length}</span> province
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {provinceCategoria.map((provincia) => (
                          <span
                            key={`${categoria}-${provincia}`}
                            className="stat-mono rounded-md border border-steel-200 bg-steel-50 px-2 py-1 text-xs font-semibold text-steel-700"
                          >
                            {provincia}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="card-muted text-sm text-neutral-600">
                Nessuna copertura impostata: scegli i servizi che offri e le province in cui intervieni.
              </p>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={80}>
          <div className="card space-y-4">
            <div className="space-y-1">
              <h2>Come funziona</h2>
              <p>Tre passaggi, nessun abbonamento.</p>
            </div>
            <ol className="space-y-3 text-sm text-neutral-600">
              <Step index={1}>Ricevi via email le richieste della tua categoria e provincia.</Step>
              <Step index={2}>Invii un preventivo gratuito con prezzo, tempi e disponibilità.</Step>
              <Step index={3}>
                Se vuoi contattare il cliente fuori piattaforma sblocchi il contatto a{" "}
                <span className="stat-mono font-semibold text-textStrong">
                  {formatCents(getServiceUnlockTotalCents())}
                </span>{" "}
                una tantum, IVA inclusa.
              </Step>
            </ol>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card card-hover space-y-1 p-4">
      <p className="table-meta">{label}</p>
      <p className="stat-mono text-3xl font-bold text-textStrong">{value}</p>
    </div>
  );
}

function Step({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="stat-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
        {index}
      </span>
      <span>{children}</span>
    </li>
  );
}
