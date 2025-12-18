import Link from "next/link";

export default function HomePage() {
  const companyBenefits = [
    "Richieste strutturate con requisiti chiari e contatti verificati.",
    "Selezione rapida di vettori affidabili con ruoli definiti.",
    "Tracciabilità di ogni passaggio per ridurre i tempi di coordinamento.",
  ];

  const transporterBenefits = [
    "Accesso a richieste qualificate senza passaggi opachi.",
    "Briefing completi per preparare documenti e mezzi prima del contatto.",
    "Pagamenti ricorrenti e controlli di identità per interazioni sicure.",
  ];

  const coreBenefits = [
    {
      title: "Affidabilità verificata",
      description:
        "Identità controllate, ruoli chiari e abbonamento obbligatorio tutelano entrambi gli interlocutori.",
    },
    {
      title: "Operazioni snelle",
      description:
        "Richieste standard e contatti diretti riducono rimbalzi, tempi morti e errori di coordinamento.",
    },
    {
      title: "Visibilità completa",
      description:
        "Ogni scambio è tracciato: requisiti, documenti e responsabilità restano sempre disponibili agli abbonati.",
    },
  ];

  return (
    <section className="space-y-12 md:space-y-16">
      <div className="card overflow-hidden bg-gradient-to-br from-surface-900/70 via-surface-900 to-surface-900/90 p-0 shadow-xl ring-1 ring-white/5">
        <div className="relative isolate overflow-hidden px-6 py-12 sm:px-10 lg:flex lg:items-center lg:gap-12 lg:px-12 lg:py-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,138,76,0.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(95,176,255,0.1),transparent_28%)]" />
          <div className="space-y-6 text-center lg:max-w-2xl lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Logistica B2B</p>
            <div className="space-y-3">
              <h1 className="text-balance text-4xl leading-tight text-white sm:text-5xl">
                DodiX – Il punto di incontro tra aziende e trasportatori
              </h1>
              <p className="text-lg text-neutral-100/80 sm:text-xl">
                La piattaforma B2B che permette alle aziende di trovare trasportatori verificati e ai trasportatori di ricevere
                richieste di lavoro reali, senza intermediari.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/register" className="btn-primary px-6 py-3 text-base">
                Iscriviti ora
              </Link>
              <Link href="/login" className="btn-secondary px-6 py-3 text-base">
                Accedi
              </Link>
              <span className="badge-verified">Accesso verificato</span>
            </div>
            <div className="grid gap-3 text-sm text-neutral-100/80 sm:grid-cols-3 sm:text-left">
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-semibold text-white">Aziende</p>
                <p className="text-neutral-100/70">Briefing chiari, contatti tracciati, carichi assegnati in modo rapido.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-semibold text-white">Trasportatori</p>
                <p className="text-neutral-100/70">Richieste reali, profili verificati, pagamenti e responsabilità definite.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-semibold text-white">Abbonamento</p>
                <p className="text-neutral-100/70">Accesso solo a utenti attivi: tutela di contatti e documenti sensibili.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 w-full lg:mt-0 lg:max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Panoramica</p>
                  <p className="text-lg font-semibold text-white">Richieste, contatti, verifiche</p>
                </div>
                <span className="rounded-lg bg-accent-500/10 px-3 py-1 text-sm font-semibold text-accent-100">B2B</span>
              </div>
              <div className="space-y-4 text-sm text-neutral-100/80">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-400" aria-hidden />
                  <div>
                    <p className="font-semibold text-white">Richieste strutturate</p>
                    <p className="text-neutral-100/70">Tempi, vincoli e documenti in un unico flusso tracciato.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-400" aria-hidden />
                  <div>
                    <p className="font-semibold text-white">Contatti verificati</p>
                    <p className="text-neutral-100/70">Identità e ruoli chiari per evitare passaggi opachi.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-400" aria-hidden />
                  <div>
                    <p className="font-semibold text-white">Abbonamento obbligatorio</p>
                    <p className="text-neutral-100/70">Protezione di dati sensibili e responsabilità reciproche.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl text-white">Benefici principali</h2>
          <span className="badge">Per aziende e trasportatori</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {coreBenefits.map((item) => (
            <div key={item.title} className="space-y-2">
              <h3 className="text-xl text-white">{item.title}</h3>
              <p className="text-neutral-100/80">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl text-white">Per aziende</h2>
            <span className="badge">Company</span>
          </div>
          <ul className="space-y-2 text-neutral-100/80">
            {companyBenefits.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl text-white">Per trasportatori</h2>
            <span className="badge">Transporter</span>
          </div>
          <ul className="space-y-2 text-neutral-100/80">
            {transporterBenefits.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl text-white">Pronto ad accedere a contatti verificati?</h2>
          <p className="text-neutral-100/80">
            Attiva l’account, scegli il tuo ruolo e opera in un ambiente controllato con responsabilità definite.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className="btn-primary px-6 py-3 text-base">
            Registrati
          </Link>
          <Link href="/login" className="btn-secondary px-6 py-3 text-base">
            Accedi
          </Link>
        </div>
      </div>
    </section>
  );
}
