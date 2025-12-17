import Link from "next/link";

export default function HomePage() {
  const steps = [
    {
      title: "Definisci la richiesta",
      description: "Specifica origine, destinazione, vincoli di tempo e requisiti di sicurezza o temperatura.",
    },
    {
      title: "Seleziona il vettore",
      description: "Confronta trasportatori verificati, disponibilità e condizioni prima di confermare.",
    },
    {
      title: "Coordina e monitora",
      description: "Gestisci documenti, contatti e avanzamento in un’unica interfaccia tracciata.",
    },
  ];

  const companyBenefits = [
    "Trasportatori verificati e specializzati in agroalimentare e industria.",
    "Tempi di risposta ridotti grazie a richieste standard e notifiche mirate.",
    "Contatti diretti e registrati, senza passaggi opachi.",
    "Un unico abbonamento aziendale con controlli di ruolo e sicurezza.",
  ];

  const transporterBenefits = [
    "Richieste qualificate da aziende export/food e industriali.",
    "Briefing chiari per ridurre viaggi a vuoto e ottimizzare i carichi.",
    "Condizioni trasparenti e contatti disponibili agli abbonati.",
    "Profilo verificato per attestare affidabilità e priorità.",
  ];

  return (
    <section className="space-y-12 md:space-y-16">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Logistica B2B senza frizioni</p>
            <h1>La piattaforma affidabile per spedire e trovare carichi critici</h1>
            <p className="text-lg text-neutral-100/80">
              DodiX collega aziende export/food e operatori industriali con trasportatori verificati. Richieste strutturate,
              assegnazione rapida e contatti sicuri in un’unica piattaforma.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Inizia ora
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              Accedi
            </Link>
            <span className="badge-verified">Utenti verificati</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="card-contrast space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-200">Per aziende</p>
              <p className="text-sm text-neutral-100/80">Richieste standard, SLA chiari, contatti verificati.</p>
            </div>
            <div className="card-contrast space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-200">Per trasportatori</p>
              <p className="text-sm text-neutral-100/80">Carichi qualificati, briefing completi, contatti protetti.</p>
            </div>
          </div>
        </div>

        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Focus aziende</p>
              <h3 className="text-2xl text-white">Controllo operativo su richieste e vettori</h3>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-accent-100">B2B</div>
          </div>
          <ul className="space-y-3 text-sm text-neutral-100/80">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Richieste standardizzate con SLA, requisiti e ruoli chiari.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Accesso a trasportatori verificati con storico e coperture assicurative.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Contatti e documenti visibili solo a profili abbonati e verificati.
            </li>
          </ul>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-100/80">
            Accesso protetto da abbonamento per aziende e trasportatori. Contatti e documenti sono disponibili solo con pagamenti attivi.
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl text-white">Perché scegliere DodiX</h2>
          <span className="badge">Supply chain affidabile</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-xl text-white">Verifiche e ruoli chiari</h3>
            <p className="text-neutral-100/80">Account aziendali e trasportatori con ruoli definiti, abbonamenti verificati e tracciabilità continua.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl text-white">Velocità operativa</h3>
            <p className="text-neutral-100/80">Richieste standard riducono rimbalzi e velocizzano l’assegnazione dei carichi.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl text-white">Contatti tracciati</h3>
            <p className="text-neutral-100/80">Contatti condivisi solo con utenti attivi e verificati, per evitare sprechi e garantire responsabilità.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl text-white">{step.title}</h3>
              <span className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-brand-900">{index + 1}</span>
            </div>
            <p className="text-neutral-100/80">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl text-white">Benefici per aziende</h2>
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
            <h2 className="text-3xl text-white">Benefici per trasportatori</h2>
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

      <div className="grid gap-6 lg:grid-cols-[1fr,0.8fr] lg:items-center">
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="badge-verified">Verified</span>
            <span className="badge">B2B network</span>
          </div>
          <h2 className="text-3xl text-white">Affidabilità e prove di fiducia</h2>
          <p className="text-neutral-100/80">
            Accessi approvati, ruoli convalidati e pagamenti ricorrenti via Stripe assicurano identità chiare e responsabilità su ogni interlocutore.
          </p>
          <p className="text-sm text-neutral-200/80">
            Contatti e documenti sono visibili solo con abbonamento attivo, proteggendo informazioni sensibili di aziende e trasportatori.
          </p>
        </div>
        <div className="card-muted space-y-4">
          <h3 className="text-xl text-white">Metriche chiave</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-100/80">
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-accent-200">24/7</div>
              <p>Disponibilità piattaforma per richieste e assegnazioni.</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-accent-200">100%</div>
              <p>Accessi protetti da abbonamento e controlli di ruolo.</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-accent-200">3</div>
              <p>Passi per pubblicare, scegliere e coordinare una spedizione.</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-accent-200">Zero</div>
              <p>Intermediari opachi: contatti diretti e tracciati.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl text-white">Pronti a operare senza frizioni?</h2>
          <p className="text-neutral-100/80">Attiva l’abbonamento e collega team aziendali e flotta in un’unica piattaforma.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/paywall" className="btn-primary px-6 py-3 text-base">
            Abbonati ora
          </Link>
          <Link href="/dashboard" className="btn-secondary px-6 py-3 text-base">
            Vai alla dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
