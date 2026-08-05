import Link from "next/link";

import { ScrollReveal } from "@/components/scroll-reveal";

const valueProps = [
  {
    title: "Trasportatori verificati",
    description: "Solo operatori reali, profilati e attivi.",
  },
  {
    title: "Contatti diretti",
    description: "Zero call center, zero intermediari.",
  },
  {
    title: "Gestione semplice",
    description: "Richieste, disponibilità e matching in un unico pannello.",
  },
];

const companyPoints = [
  "Pubblica richieste di trasporto",
  "Ricevi contatti qualificati",
  "Risparmia tempo e costi",
];

const transporterPoints = [
  "Accedi a richieste reali",
  "Nessuna gara al ribasso",
  "Contatti diretti con le aziende",
];

const stats = [
  { value: "0€", label: "Commissioni nascoste" },
  { value: "100%", label: "Contatti verificati" },
  { value: "24/7", label: "Richieste attive" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-appBg text-textStrong">
      <div className="mx-auto flex max-w-6xl flex-col space-y-16 px-6 py-10 md:space-y-24 md:py-16 lg:px-8">
        <section className="bg-road card-contrast animate-fadeUp">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">
            Logistica B2B
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl text-white md:text-6xl">
            Dove aziende e trasportatori si incontrano. Senza intermediari.
          </h1>
          <p className="mt-4 max-w-xl text-base text-neutral-200/85 md:text-lg">
            La piattaforma B2B che connette domanda e offerta nel mondo dei trasporti,
            con contatti diretti e verificati.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Registrati ora
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              Accedi
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="stat-mono text-2xl font-semibold text-white md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase leading-tight text-neutral-300/80 sm:text-xs sm:tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {valueProps.map((item, i) => (
            <ScrollReveal key={item.title} delayMs={i * 100}>
              <div className="card card-hover h-full space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-700 to-brand-900 text-lg font-semibold text-accent-300">
                  •
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ScrollReveal>
            <div className="card card-hover h-full space-y-4">
              <div className="space-y-2">
                <h2>Sei un&apos;azienda che deve spedire?</h2>
                <p>Pubblica incarichi e ricevi contatti verificati in modo diretto e misurabile.</p>
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-neutral-600">
                {companyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="/register?role=company" className="btn-primary w-fit">
                Registrati ora
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={100}>
            <div className="card card-hover h-full space-y-4">
              <div className="space-y-2">
                <h2>Sei un trasportatore?</h2>
                <p>Accedi solo a richieste reali pubblicate da aziende attive nel settore.</p>
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-neutral-600">
                {transporterPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="/register?role=transporter" className="btn-secondary w-fit">
                Registrati ora
              </Link>
            </div>
          </ScrollReveal>
        </section>

        <ScrollReveal as="section">
          <div className="card-contrast bg-road space-y-4 text-center">
            <h2 className="text-white">Inizia ora su DodiX – Il Camionista</h2>
            <p className="mx-auto max-w-xl text-neutral-200/85">
              Contatti diretti, operatori verificati e gestione completa in un&apos;unica piattaforma.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/register" className="btn-primary px-6 py-3 text-base">
                Crea il tuo account
              </Link>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-300/80">
                Nessun intermediario. Contatto diretto.
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
