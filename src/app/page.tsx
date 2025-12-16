const features = [
  {
    title: "Diari di viaggio",
    description: "Raccogli dettagli di carichi, scarichi e note utili per ogni viaggio in pochi tocchi.",
  },
  {
    title: "Aggiornamenti rapidi",
    description: "Invia status a spedizionieri e clienti direttamente dal telefono, senza chiamate inutili.",
  },
  {
    title: "Roadmap chiara",
    description: "Tieni traccia delle prossime tappe e delle scadenze per non perdere un passaggio importante.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 pb-20 pt-16">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold shadow-lg shadow-brand-500/40">
            DX
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">MVP Logistica</p>
            <h1 className="text-3xl font-bold md:text-4xl">DodiX – Il Camionista</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-white/70">
          <span className="rounded-full bg-white/10 px-4 py-2">Next.js + React</span>
          <span className="rounded-full bg-white/10 px-4 py-2">Tailwind CSS</span>
          <span className="rounded-full bg-white/10 px-4 py-2">Prisma + SQLite</span>
        </div>
      </header>

      <section className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <div className="card p-8">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            MVP operativo
          </div>
          <h2 className="mt-3 text-2xl font-semibold">Organizza corse e aggiornamenti senza distrazioni</h2>
          <p className="mt-3 text-white/70">
            Una base solida per costruire strumenti dedicati ai trasportatori: viaggi, comunicazioni e visibilità sulle
            tratte, senza funzioni superflue. Crescerà con feedback reali su strada.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="btn-primary" href="#features">
              Esplora le funzioni
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              href="#cta"
            >
              Contattaci
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div className="card relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-white/5" aria-hidden />
          <div className="relative space-y-4">
            <h3 className="text-lg font-semibold">Stato di oggi</h3>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Carico</span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">OK</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Scarico</span>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">14:30</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Documenti</span>
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-indigo-100">Pronti</span>
              </div>
            </div>
            <p className="text-xs text-white/60">
              Demo statica per illustrare la direzione del prodotto. Con Prisma e SQLite sarà possibile salvare e leggere
              dati di prova.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-6">
        <h2 className="text-2xl font-semibold">Cosa include l'MVP</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card h-full p-6">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="card flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Costruiamo il prossimo rilascio</h3>
          <p className="text-sm text-white/70">
            Questo MVP è il punto di partenza: database SQLite con Prisma, API Next.js e una UI veloce pronta per test sul
            campo.
          </p>
        </div>
        <a className="btn-primary" href="mailto:team@dodix.app">
          Scrivici
        </a>
      </section>
    </main>
  );
}
