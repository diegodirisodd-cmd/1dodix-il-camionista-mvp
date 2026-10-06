"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

export default function RegisterPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setResult(null);
    setError(null);

    startTransition(async () => {
      try {
        const payload = Object.fromEntries(formData.entries());
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data?.error ?? "Registrazione non riuscita. Riprova.");
          return;
        }

        setResult("Account creato.");
        router.replace((data?.redirectTo as string) || "/dashboard");
      } catch (err) {
        console.error("Errore durante la registrazione", err);
        setError("Registrazione non riuscita. Controlla i dati e riprova.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-appBg px-4 py-10 text-textStrong sm:px-6">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="animate-fadeUp space-y-3 text-center">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-2 shadow-card">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-brand-900">
                <Image src="/dodix-logo.svg" alt="Logo DodiX" fill sizes="56px" className="object-contain" priority />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[11px] uppercase tracking-[0.3em] text-accent-600">DodiX</p>
                <p className="text-lg font-semibold text-textStrong">Il Camionista</p>
              </div>
            </div>
          </div>
          <h1>Registrati gratis</h1>
          <p className="mx-auto max-w-2xl text-neutral-600">
            Nessun abbonamento. Si paga il 2% + IVA solo quando un carico viene assegnato.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="card-contrast bg-road animate-fadeUp space-y-6">
            <div className="space-y-1">
              <h3 className="text-white">Dati account</h3>
              <p className="text-sm text-neutral-200/80">
                Un minuto, cinque campi. Il resto quando ti serve.
              </p>
            </div>

            {result && (
              <p className="alert-success" aria-live="polite">
                {result}
              </p>
            )}
            {error && (
              <p className="alert-danger" role="alert" aria-live="assertive">
                {error}
              </p>
            )}

            <form className="space-y-5" action={handleSubmit}>
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-widest text-accent-300">Chi sei *</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { value: "transporter", title: "Trasportatore", text: "Cerco carichi" },
                    { value: "company", title: "Azienda", text: "Devo spedire" },
                    { value: "supplier", title: "Officina / servizi", text: "Lavoro sui mezzi" },
                  ].map((r) => (
                    <label
                      key={r.value}
                      className="flex min-h-[64px] cursor-pointer flex-col justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 transition has-[:checked]:border-accent-500 has-[:checked]:bg-accent-500/15"
                    >
                      <input type="radio" name="role" value={r.value} required className="sr-only" />
                      <span className="font-semibold text-white">{r.title}</span>
                      <span className="text-xs text-neutral-300">{r.text}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="form-field">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="firstName">Nome *</label>
                  <input className="input-field-dark" id="firstName" name="firstName" type="text" required autoComplete="given-name" />
                </div>
                <div className="form-field">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="companyName">Azienda / ragione sociale</label>
                  <input className="input-field-dark" id="companyName" name="companyName" type="text" autoComplete="organization" />
                </div>
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="phone">Cellulare (WhatsApp) *</label>
                <input className="input-field-dark" id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="333 1234567" />
                <p className="text-xs text-neutral-300/70">Ti avvisiamo qui per nuovi carichi, candidature e conferme. Non lo mostriamo a nessuno prima della conferma.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="form-field">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="email">Email *</label>
                  <input className="input-field-dark" id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="form-field">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="password">Password *</label>
                  <input className="input-field-dark" id="password" name="password" type="password" minLength={6} required autoComplete="new-password" />
                  <p className="text-xs text-neutral-300/70">Almeno 6 caratteri.</p>
                </div>
              </div>

              <p className="text-xs text-neutral-300/80">
                P.IVA, indirizzo e mezzi li aggiungi dopo dal profilo. Registrandoti accetti di ricevere avvisi WhatsApp da DodiX; puoi disattivarli quando vuoi.
              </p>

              <div className="form-actions justify-between">
                <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto">
                  {isPending ? "Creazione in corso..." : "Crea account gratis"}
                </button>
                <span className="text-sm text-neutral-300">
                  Hai già un account?{" "}
                  <Link
                    className="inline-flex min-h-[44px] items-center px-1 text-accent-300 underline"
                    href="/login"
                  >
                    Accedi
                  </Link>
                </span>
              </div>
            </form>
          </div>

          <div className="card-muted animate-fadeUp space-y-4">
            <h3>Guida rapida</h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li className="flex items-start gap-3">
                <span className="badge">Ruoli</span>
                <span>Trasportatore: si candida ai carichi. Azienda: pubblica i carichi e sceglie. Officina / servizi: risponde alle richieste della Borsa Servizi.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">WhatsApp</span>
                <span>I trasportatori ricevono un messaggio appena viene pubblicato un nuovo carico, senza dover controllare la piattaforma.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">Costi</span>
                <span>Iscrizione e candidature gratuite. Quando l&apos;azienda sceglie il trasportatore, pagano entrambi il 2% + IVA e si scambiano i contatti.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">Contatti</span>
                <span>Verificati e diretti, senza call center o intermediari.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">Supporto</span>
                <span>Chat interna per chiarire i dettagli prima di decidere.</span>
              </li>
            </ul>
            <div className="rounded-xl border border-steel-200 bg-white px-4 py-3 text-sm text-neutral-600">
              Dopo la registrazione: i trasportatori scelgono mezzi e regioni, le aziende pubblicano subito il primo carico.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
