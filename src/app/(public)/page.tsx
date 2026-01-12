import Link from "next/link";

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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#0f172a]">
      <div className="mx-auto flex max-w-6xl flex-col space-y-16 px-6 py-16 md:space-y-20 md:py-20 lg:px-8">
        <section className="space-y-8 rounded-3xl border border-[#e2e8f0] bg-white p-10 shadow-sm">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">Logistica B2B</p>
            <h1 className="text-4xl font-semibold leading-tight text-[#0f172a] md:text-5xl">
              Dove aziende e trasportatori si incontrano. Senza intermediari.
            </h1>
            <p className="text-lg leading-relaxed text-[#475569] md:text-xl">
              La piattaforma B2B che connette domanda e offerta nel mondo dei trasporti.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#f97316] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#ea6a0d]"
            >
              Registrati ora
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-6 py-3 text-base font-semibold text-[#0f172a] shadow-sm transition hover:border-[#f97316] hover:text-[#0f172a]"
            >
              Accedi
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {valueProps.map((item) => (
            <div
              key={item.title}
              className="space-y-3 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b3c5d] text-lg font-semibold text-white">
                •
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a]">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[#475569]">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#0f172a]">Sei un’azienda che deve spedire?</h2>
              <p className="text-sm leading-relaxed text-[#475569]">
                Pubblica incarichi e ricevi contatti verificati in modo diretto e misurabile.
              </p>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-[#475569]">
              {companyPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f97316]" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=company"
              className="inline-flex w-fit items-center justify-center rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea6a0d]"
            >
              Registrati ora
            </Link>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#0f172a]">Sei un trasportatore?</h2>
              <p className="text-sm leading-relaxed text-[#475569]">
                Accedi solo a richieste reali pubblicate da aziende attive nel settore.
              </p>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-[#475569]">
              {transporterPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f97316]" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=transporter"
              className="inline-flex w-fit items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:border-[#f97316]"
            >
              Registrati ora
            </Link>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#e2e8f0] bg-white p-10 text-center shadow-sm">
          <h2 className="text-3xl font-semibold text-[#0f172a]">Inizia ora su DodiX – Il Camionista</h2>
          <p className="text-base leading-relaxed text-[#475569]">
            Contatti diretti, operatori verificati e gestione completa in un’unica piattaforma.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#f97316] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#ea6a0d]"
            >
              Crea il tuo account
            </Link>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#64748b]">
              Nessun intermediario. Contatto diretto.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
