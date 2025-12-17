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
      <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Piattaforma B2B per logistica</p>
            <h1>DodiX unisce aziende e trasportatori in un flusso controllato</h1>
            <p className="text-lg text-neutral-100/80">
              Una sola piattaforma per pubblicare richieste, contattare vettori verificati e mantenere ogni interazione tracciata. Senza
              passaggi opachi, con responsabilità chiare e abbonamento obbligatorio per tutti.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Registrati
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              Accedi
            </Link>
            <span className="badge-verified">Accesso verificato</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-contrast space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-200">Per aziende</p>
              <p className="text-sm text-neutral-100/80">Richieste strutturate, selezione dei vettori e contatti tracciati.</p>
            </div>
            <div className="card-contrast space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-200">Per trasportatori</p>
              <p className="text-sm text-neutral-100/80">Carichi qualificati, briefing completi e contatti protetti dagli abbonamenti.</p>
            </div>
          </div>
        </div>

        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Come funziona</p>
              <h3 className="text-2xl text-white">Tre passaggi chiari per operare</h3>
            </div>
            <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-accent-100">B2B</span>
          </div>
          <ul className="space-y-3 text-sm text-neutral-100/80">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Pubblica o ricevi richieste con requisiti, tempi e vincoli definiti.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Seleziona contatti verificati e condividi documenti solo con utenti attivi.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Coordina l’assegnazione con uno storico unico e responsabilità chiare.
            </li>
          </ul>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-100/80">
            Accesso consentito solo ad abbonati: tutela di contatti, documenti e processi per entrambe le parti.
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
