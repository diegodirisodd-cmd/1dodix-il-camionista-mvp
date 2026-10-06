import type { Metadata } from "next";
import Link from "next/link";

import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  // Titolo assoluto: il template del root layout non si applica al segmento in
  // cui e' definito, quindi la home deve portarsi dietro il nome del prodotto.
  title: "DodiX – Il Camionista · Logistica B2B senza intermediari",
  description:
    "La borsa carichi e servizi per il trasporto: aziende e trasportatori si incontrano senza intermediari, e officine, telonai, gommisti e soccorso stradale rispondono alle richieste della Borsa Servizi.",
};

const valueProps = [
  {
    title: "Solo i carichi della tua zona",
    description:
      "Scegli mezzi e regioni: ti arriva su WhatsApp solo quello che puoi fare davvero. Niente spam da mezza Italia.",
  },
  {
    title: "Paghi solo se ti scelgono",
    description:
      "Candidarti è gratis. Il 2% + IVA si paga solo quando l'azienda sceglie te e confermi: mai soldi a vuoto.",
  },
  {
    title: "Proponi il tuo prezzo e parla in chat",
    description:
      "Accetti il prezzo dell'azienda o ne proponi un altro, chiarisci i dettagli in chat, poi vi scambiate i contatti.",
  },
];

const companyPoints = [
  "Pubblichi gratis in un minuto: arriva su WhatsApp ai trasportatori della zona",
  "Ricevi candidature con prezzo, profilo, mezzi e recensioni",
  "Scegli tu chi far lavorare: paghi il 2% + IVA solo quando scegli",
];

const transporterPoints = [
  "Ricevi un WhatsApp appena esce un carico nelle tue regioni",
  "Ti candidi gratis e proponi il tuo prezzo",
  "Cerchi un servizio per il mezzo? Lo chiedi nella Borsa Servizi",
];

// Terzo pubblico della piattaforma, oltre ad aziende e trasportatori: i
// fornitori della Borsa Servizi. Volutamente niente elenco chiuso di mestieri
// nel titolo della card, perche' le categorie sono destinate a crescere.
const supplierPoints = [
  "Ricevi le richieste della tua zona e della tua categoria",
  "Rispondi con un preventivo: prezzo, tempi e disponibilità",
  "Iscrizione gratuita, paghi solo per sbloccare il contatto",
];

// Nessun contatore di volumi qui: con i numeri attuali comunicherebbe una
// piattaforma vuota invece di invogliare all'iscrizione. Questi tre dati sono
// veri a qualsiasi scala e restano validi mentre la piattaforma cresce.
const stats = [
  { value: "0€", label: "Iscrizione, abbonamento e candidature", mono: true },
  { value: "2%", label: "Solo a carico assegnato", mono: true },
  { value: "WhatsApp", label: "Avvisi solo nelle tue zone", mono: false },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-appBg text-textStrong">
      <div className="mx-auto flex max-w-6xl flex-col space-y-16 px-6 py-10 md:space-y-24 md:py-16 lg:px-8">
        <section className="bg-road card-contrast animate-fadeUp">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">
            Logistica B2B
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl text-white sm:text-4xl md:text-5xl">
            DodiX, la borsa carichi e servizi dove aziende e trasportatori si
            incontrano. Senza intermediari.
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
                {/* text-lg sotto sm: a 390px tre colonne non reggono "WhatsApp"
                    a text-2xl e la parola veniva tagliata dal bordo. */}
                <p
                  className={`text-lg font-semibold text-white sm:text-2xl md:text-3xl ${
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

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ScrollReveal>
            <div className="card card-hover flex h-full flex-col space-y-4">
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
              <Link href="/register?role=company" className="btn-primary mt-auto w-fit">
                Registrati ora
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={100}>
            <div className="card card-hover flex h-full flex-col space-y-4">
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
              <Link href="/register?role=transporter" className="btn-secondary mt-auto w-fit">
                Registrati ora
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={200}>
            <div className="card card-hover flex h-full flex-col space-y-4">
              <div className="space-y-2">
                <h2>Offri servizi per i mezzi pesanti?</h2>
                <p>
                  Telonai, officine, gommisti, soccorso stradale, carrozzerie e lavaggi:
                  le richieste arrivano a te, tu rispondi con un preventivo.
                </p>
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-neutral-600">
                {supplierPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="/register?role=supplier" className="btn-secondary mt-auto w-fit">
                Registrati ora
              </Link>
            </div>
          </ScrollReveal>
        </section>

        <ScrollReveal as="section">
          <div className="card-contrast bg-road space-y-4 text-center">
            <h2 className="text-white">Inizia ora su DodiX – Il Camionista</h2>
            <p className="mx-auto max-w-xl text-neutral-200/85">
              Carichi da trasportare e servizi per il mezzo, con iscrizione gratuita e
              contatto diretto fra le parti.
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
