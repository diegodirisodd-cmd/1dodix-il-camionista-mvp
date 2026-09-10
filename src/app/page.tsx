import type { Metadata } from "next";
import Link from "next/link";

import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  // Titolo assoluto: il template del root layout non si applica al segmento in
  // cui e' definito, quindi la home deve portarsi dietro il nome del prodotto.
  title: "DodiX – Il Camionista · Logistica B2B senza intermediari",
  description:
    "Aziende e trasportatori si incontrano su DodiX: richieste di trasporto strutturate, contatti diretti e verificati, nessuna gara al ribasso.",
};

const valueProps = [
  {
    title: "Avviso WhatsApp immediato",
    description:
      "Ogni nuovo carico arriva su WhatsApp appena viene pubblicato. Niente pagine da ricaricare, niente occasioni perse.",
  },
  {
    title: "Paghi solo se concludi",
    description:
      "Iscrizione e abbonamento gratuiti. Il 2% si paga soltanto quando sblocchi il contatto di un carico.",
  },
  {
    title: "Contatti diretti",
    description:
      "Parli con l'azienda, non con un call center. Nessun intermediario e nessuna gara al ribasso.",
  },
];

const companyPoints = [
  "Il tuo carico arriva su WhatsApp a tutti i trasportatori iscritti",
  "Pubblichi in pochi minuti, senza intermediari",
  "Ricevi contatti qualificati, non preventivi al ribasso",
];

const transporterPoints = [
  "Ricevi un WhatsApp appena esce un carico",
  "Accedi a richieste reali, pubblicate da aziende registrate",
  "Nessun abbonamento: paghi il 2% solo se sblocchi un contatto",
];

// Nessun contatore di volumi qui: con i numeri attuali comunicherebbe una
// piattaforma vuota invece di invogliare all'iscrizione. Questi tre dati sono
// veri a qualsiasi scala e restano validi mentre la piattaforma cresce.
const stats = [
  { value: "0€", label: "Iscrizione e abbonamento", mono: true },
  { value: "2%", label: "Solo a contatto sbloccato", mono: true },
  { value: "WhatsApp", label: "Avviso a ogni nuovo carico", mono: false },
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
            Le aziende pubblicano i carichi, i trasportatori li ricevono su WhatsApp
            nel momento stesso in cui escono. Contatto diretto, senza abbonamenti.
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
                <p
                  className={`text-2xl font-semibold text-white md:text-3xl ${
                    stat.mono ? "stat-mono" : ""
                  }`}
                >
                  {stat.value}
                </p>
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
                <p>
                  Non devi controllare niente: appena un&apos;azienda pubblica un carico ti
                  arriva un messaggio su WhatsApp.
                </p>
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
              Iscrizione gratuita, avvisi WhatsApp sui nuovi carichi e contatto diretto
              con chi spedisce.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/register" className="btn-primary px-6 py-3 text-base">
                Crea il tuo account
              </Link>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-300/80">
                Gratis. Nessun abbonamento.
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
