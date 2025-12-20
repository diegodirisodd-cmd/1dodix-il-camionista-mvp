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
    <main className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="mx-auto flex max-w-6xl flex-col space-y-16 px-6 py-16 md:space-y-20 md:py-20 lg:px-8">
        <section className="space-y-8 rounded-3xl border border-[#1E293B] bg-[#0F172A] p-10 shadow-2xl">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#CBD5E1]">
              Logistica B2B
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-[#F8FAFC] md:text-5xl">
              Dove aziende e trasportatori si incontrano. Senza intermediari.
            </h1>
            <p className="text-lg leading-relaxed text-[#CBD5E1] md:text-xl">
              La piattaforma B2B che connette domanda e offerta nel mondo dei trasporti.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#F97316] px-6 py-3 text-base font-semibold text-[#0F172A] transition hover:brightness-110"
            >
              Registrati ora
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-[#1E293B] bg-[#020617] px-6 py-3 text-base font-semibold text-[#F8FAFC] transition hover:border-[#F97316] hover:text-[#F97316]"
            >
              Accedi
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {valueProps.map((item) => (
            <div
              key={item.title}
              className="space-y-3 rounded-2xl border border-[#1E293B] bg-[#020617] p-6 shadow-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F172A] text-lg font-semibold text-[#F97316]">
                •
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[#CBD5E1]">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-[#1E293B] bg-[#020617] p-6 shadow-xl">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#F8FAFC]">Sei un’azienda che deve spedire?</h2>
              <p className="text-sm leading-relaxed text-[#CBD5E1]">
                Pubblica incarichi e ricevi contatti verificati in modo diretto e misurabile.
              </p>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-[#CBD5E1]">
              {companyPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F97316]" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=company"
              className="inline-flex w-fit items-center justify-center rounded-full bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:brightness-110"
            >
              Registrati ora
            </Link>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#1E293B] bg-[#020617] p-6 shadow-xl">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#F8FAFC]">Sei un trasportatore?</h2>
              <p className="text-sm leading-relaxed text-[#CBD5E1]">
                Accedi solo a richieste reali pubblicate da aziende attive nel settore.
              </p>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-[#CBD5E1]">
              {transporterPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F97316]" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=transporter"
              className="inline-flex w-fit items-center justify-center rounded-full border border-[#1E293B] bg-[#020617] px-5 py-2.5 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#F97316] hover:text-[#F97316]"
            >
              Registrati ora
            </Link>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#1E293B] bg-[#0F172A] p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-semibold text-[#F8FAFC]">Inizia ora su DodiX – Il Camionista</h2>
          <p className="text-base leading-relaxed text-[#CBD5E1]">
            Contatti diretti, operatori verificati e gestione completa in un’unica piattaforma.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#F97316] px-6 py-3 text-base font-semibold text-[#0F172A] transition hover:brightness-110"
            >
              Crea il tuo account
            </Link>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#CBD5E1]">
              Nessun intermediario. Contatto diretto.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
