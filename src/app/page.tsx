import Link from "next/link";

export default function HomePage() {
  const steps = [
    {
      title: "Definisci la richiesta",
      description: "Inserisci origine, destinazione, tempistiche e requisiti di sicurezza o temperatura.",
    },
    {
      title: "Seleziona il vettore",
      description: "Valuta trasportatori verificati, disponibilità e tariffe prima di confermare.",
    },
    {
      title: "Coordina e monitora",
      description: "Allinea documenti, contatti e stati di viaggio in un’unica interfaccia.",
    },
  ];

  const companyBenefits = [
    "Autotrasportatori verificati e specializzati in agroalimentare e industria.",
    "Tempi di risposta rapidi grazie a richieste strutturate e notifiche mirate.",
    "Contatti diretti e tracciati, senza intermediari opachi.",
    "Abbonamento unico per tutta l’azienda con controlli di ruolo e sicurezza.",
  ];

  const transporterBenefits = [
    "Richieste qualificate da aziende export/food e industriali.",
    "Dettagli tecnici chiari per ridurre i viaggi a vuoto e ottimizzare i carichi.",
    "Pagamenti e condizioni trasparenti, con contatti disponibili ai clienti abbonati.",
    "Profilo aziendale e verifiche per distinguersi dai concorrenti.",
  ];

  return (
    <section className="space-y-10 md:space-y-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">Logistica B2B senza frizioni</p>
            <h1>La piattaforma affidabile per spedire e trovare carichi critici</h1>
            <p className="text-lg text-neutral-800">
              DodiX collega aziende export/food e operatori industriali con autotrasportatori verificati.
              Un’unica esperienza per richieste strutturate, assegnazione rapida e contatti verificati.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">
              Inizia ora
            </Link>
            <Link href="/login" className="btn-secondary">
              Accedi
            </Link>
            <span className="badge-verified">Utenti verificati</span>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Focus aziende</p>
              <h3>Controllo totale su richieste e vettori</h3>
            </div>
            <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800">B2B</div>
          </div>
          <ul className="space-y-3 text-sm text-neutral-800">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Richieste standardizzate con SLA e requisiti speciali.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Accesso a trasportatori verificati con storico e coperture.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Contatti e documenti disponibili solo per account abbonati.
            </li>
          </ul>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
            Stripe billing attivo per tutti gli utenti: controlli di accesso e contatti sono abilitati solo con abbonamento.
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2>Perché scegliere DodiX</h2>
          <span className="badge">Supply chain affidabile</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3>Verifiche e ruoli chiari</h3>
            <p>Account aziendali e autotrasportatori con ruoli definiti, controlli di abbonamento e audit.</p>
          </div>
          <div className="space-y-2">
            <h3>Velocità operativa</h3>
            <p>Richieste standardizzate riducono back-and-forth e garantiscono risposte più rapide.</p>
          </div>
          <div className="space-y-2">
            <h3>Contatti tracciati</h3>
            <p>Dettagli di contatto disponibili solo a utenti attivi, con visibilità controllata e sicura.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3>{step.title}</h3>
              <span className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-brand-900">{index + 1}</span>
            </div>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2>Benefici per aziende</h2>
            <span className="badge">Company</span>
          </div>
          <ul className="space-y-2 text-neutral-800">
            {companyBenefits.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2>Benefici per trasportatori</h2>
            <span className="badge">Transporter</span>
          </div>
          <ul className="space-y-2 text-neutral-800">
            {transporterBenefits.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,0.8fr] lg:items-center">
        <div className="card space-y-3">
          <div className="flex items-center gap-3">
            <span className="badge-verified">Verified</span>
            <span className="badge">B2B network</span>
          </div>
          <h2>Affidabilità e prove di fiducia</h2>
          <p>
            Iscrizioni approvate, ruoli convalidati e pagamenti ricorrenti via Stripe assicurano che ogni interlocutore sia
            tracciato e operi secondo standard professionali.
          </p>
          <p className="text-sm text-neutral-700">
            Contatti e documenti sono visibili solo con abbonamento attivo, proteggendo informazioni sensibili di aziende e vettori.
          </p>
        </div>
        <div className="card-muted space-y-3">
          <h3>Metriche chiave</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-800">
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-brand-900">24/7</div>
              <p>Disponibilità piattaforma per richieste e assegnazioni.</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-brand-900">100%</div>
              <p>Accessi protetti da abbonamento e controlli di ruolo.</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-brand-900">3</div>
              <p>Passi per pubblicare, scegliere e coordinare una spedizione.</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-brand-900">Zero</div>
              <p>Intermediari opachi: contatti diretti e tracciati.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2>Pronti a operare senza frizioni?</h2>
          <p className="text-neutral-800">Attiva l’abbonamento e collega team aziendali e flotta in un’unica piattaforma.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/paywall" className="btn-primary">
            Abbonati ora
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Vai alla dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
