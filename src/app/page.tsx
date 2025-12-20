import Link from "next/link";

const valueProps = [
  {
    title: "Niente intermediari",
    description: "Contatti diretti, senza commissioni e perdite di tempo.",
  },
  {
    title: "Solo operatori verificati",
    description: "Aziende e trasportatori selezionati, profili reali.",
  },
  {
    title: "Abbonamento chiaro",
    description: "Un solo piano annuale. Zero sorprese.",
  },
];

const companyPoints = [
  "Pubblica richieste di trasporto",
  "Ricevi contatti diretti",
  "Gestisci tutto da un’unica dashboard",
];

const transporterPoints = [
  "Visualizza richieste reali",
  "Accedi ai contatti solo con abbonamento attivo",
  "Lavora con aziende verificate",
];

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-20">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-surface-900 via-surface-900/90 to-black p-8 shadow-xl ring-1 ring-white/5 md:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">Logistica B2B</p>
              <h1 className="text-balance text-4xl font-semibold leading-tight text-white md:text-5xl">
                Il punto di incontro diretto tra aziende e trasportatori
              </h1>
              <p className="text-lg text-neutral-100/85 md:text-xl">
                DodiX è la piattaforma B2B che connette aziende di produzione e trasportatori verificati, senza intermediari.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/register?role=company" className="btn-primary px-6 py-3 text-base">
                Registrati come Azienda
              </Link>
              <Link href="/register?role=transporter" className="btn-secondary px-6 py-3 text-base">
                Registrati come Trasportatore
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-neutral-100/85">
                <p className="text-sm font-semibold text-white">Contatto diretto</p>
                <p className="text-sm">Zero passaggi opachi: aziende e trasportatori dialogano subito.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-neutral-100/85">
                <p className="text-sm font-semibold text-white">Profili verificati</p>
                <p className="text-sm">Identità e ruoli controllati per tutelare ogni incarico.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-neutral-100/85">
                <p className="text-sm font-semibold text-white">Abbonamento unico</p>
                <p className="text-sm">Accesso annuale obbligatorio per mantenere qualità e sicurezza.</p>
              </div>
            </div>
          </div>

          <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,138,76,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(95,176,255,0.1),transparent_35%)]" />
            <div className="space-y-4 text-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-200">Panoramica</p>
                  <p className="text-lg font-semibold text-white">Accesso premium DodiX</p>
                </div>
                <span className="rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-50">B2B</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Richieste attive</p>
                  <p className="text-2xl font-semibold text-accent-100">Live</p>
                  <p className="text-xs text-neutral-100/70">Strutturate e assegnabili in pochi minuti.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Contatti verificati</p>
                  <p className="text-2xl font-semibold text-accent-100">Protetti</p>
                  <p className="text-xs text-neutral-100/70">Visibili solo con abbonamento attivo.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                  <p className="text-sm font-semibold text-white">Abbonamento annuale</p>
                  <p className="text-lg text-neutral-100/85">
                    Un’unica quota per aziende e trasportatori: trasparenza e continuità operativa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card space-y-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl text-white">Perché DodiX</h2>
          <span className="badge">Value proposition</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {valueProps.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-surface-800/80 p-6 shadow-inner">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/15 text-sm font-semibold text-accent-100 ring-1 ring-accent-500/25">
                •
              </div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-100/80">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-3xl text-white">Per le aziende di produzione</h2>
            <span className="badge">Aziende</span>
          </div>
          <ul className="space-y-2 text-neutral-100/85">
            {companyPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-400" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Link href="/register?role=company" className="btn-primary w-full justify-center px-5 py-3 text-base">
              Iscriviti come Azienda
            </Link>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-3xl text-white">Per trasportatori e logistica</h2>
            <span className="badge">Trasportatori</span>
          </div>
          <ul className="space-y-2 text-neutral-100/85">
            {transporterPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-400" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Link href="/register?role=transporter" className="btn-secondary w-full justify-center px-5 py-3 text-base">
              Iscriviti come Trasportatore
            </Link>
          </div>
        </div>
      </section>

      <section className="card flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-200">Trasparenza</p>
          <h2 className="text-3xl text-white">Un solo abbonamento</h2>
          <p className="text-neutral-100/80">Valido per aziende e trasportatori</p>
        </div>
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 px-6 py-5 text-left shadow-inner">
          <p className="text-4xl font-semibold text-white">360€ / anno</p>
          <p className="mt-1 text-sm text-neutral-100/80">Accesso completo, contatti verificati, assistenza prioritaria.</p>
          <div className="mt-4 flex flex-wrap gap-3 md:justify-start">
            <Link href="/paywall" className="btn-primary px-6 py-3 text-base">
              Attiva l’accesso
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              Già abbonato? Accedi
            </Link>
          </div>
        </div>
      </section>

      <footer className="rounded-2xl bg-neutral-100/90 px-6 py-8 text-sm text-neutral-800 shadow-inner ring-1 ring-neutral-200/80">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-neutral-900">DodiX – Il Camionista | Ecosistema digitale per il trasporto</p>
          <div className="flex flex-wrap items-center gap-4 font-medium">
            <Link href="/login" className="transition hover:text-accent-700">
              Login
            </Link>
            <Link href="/register" className="transition hover:text-accent-700">
              Registrazione
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
