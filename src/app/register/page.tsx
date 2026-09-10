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

        setResult("Account creato con successo. Completa l'onboarding per iniziare.");
        router.replace((data?.redirectTo as string) || "/onboarding");
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Onboarding</p>
          <h1>Registrati</h1>
          <p className="mx-auto max-w-2xl text-neutral-600">
            Crea un account con i tuoi dati aziendali per accedere a richieste e contatti.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="card-contrast bg-road animate-fadeUp space-y-6">
            <div className="space-y-1">
              <h3 className="text-white">Dati account</h3>
              <p className="text-sm text-neutral-200/80">
                Compila i campi obbligatori. I campi con * sono richiesti.
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
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-300">Dati personali</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="form-field">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="firstName">Nome *</label>
                  <input className="input-field-dark" id="firstName" name="firstName" type="text" required autoComplete="given-name" />
                </div>
                <div className="form-field">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="lastName">Cognome *</label>
                  <input className="input-field-dark" id="lastName" name="lastName" type="text" required autoComplete="family-name" />
                </div>
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="email">Email *</label>
                <input className="input-field-dark" id="email" name="email" type="email" required autoComplete="email" />
                <p className="text-xs text-neutral-300/70">Verrà usata per gli avvisi e il login.</p>
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="password">Password *</label>
                <input className="input-field-dark" id="password" name="password" type="password" minLength={6} required autoComplete="new-password" />
                <p className="text-xs text-neutral-300/70">Almeno 6 caratteri.</p>
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="phone">Telefono</label>
                <input className="input-field-dark" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+39 ..." />
              </div>

              <div className="space-y-1 pt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-300">Dati aziendali</p>
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="companyName">Ragione sociale *</label>
                <input className="input-field-dark" id="companyName" name="companyName" type="text" required autoComplete="organization" />
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="vatNumber">Partita IVA *</label>
                <input className="input-field-dark" id="vatNumber" name="vatNumber" type="text" required placeholder="IT12345678901" pattern="[A-Za-z]{0,2}[0-9]{11,13}" title="Inserisci una partita IVA valida (es. IT12345678901)" />
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="contactPerson">Persona di contatto</label>
                <input className="input-field-dark" id="contactPerson" name="contactPerson" type="text" autoComplete="name" />
              </div>

              <div className="space-y-1 pt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-300">Sede operativa</p>
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="address">Indirizzo *</label>
                <input className="input-field-dark" id="address" name="address" type="text" required autoComplete="street-address" placeholder="Via Roma 1" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="form-field sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="city">Città *</label>
                  <input className="input-field-dark" id="city" name="city" type="text" required autoComplete="address-level2" />
                </div>
                <div className="form-field">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="province">Provincia *</label>
                  <input className="input-field-dark" id="province" name="province" type="text" required maxLength={2} placeholder="MI" autoComplete="address-level1" />
                </div>
                <div className="form-field">
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="zipCode">CAP *</label>
                  <input className="input-field-dark" id="zipCode" name="zipCode" type="text" required pattern="[0-9]{5}" title="Inserisci un CAP valido (5 cifre)" placeholder="20100" autoComplete="postal-code" />
                </div>
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="country">Paese</label>
                <select className="input-field-dark" id="country" name="country" defaultValue="IT" autoComplete="country">
                  <option value="IT">Italia</option>
                  <option value="FR">Francia</option>
                  <option value="DE">Germania</option>
                  <option value="ES">Spagna</option>
                  <option value="AT">Austria</option>
                  <option value="CH">Svizzera</option>
                </select>
              </div>

              <div className="space-y-1 pt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-300">Tipo account</p>
              </div>

              <div className="form-field">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-200" htmlFor="role">Ruolo *</label>
                <select className="input-field-dark" id="role" name="role" required defaultValue="">
                  <option value="" disabled>Seleziona un ruolo</option>
                  <option value="company">Azienda (spedisco merce)</option>
                  <option value="transporter">Trasportatore (trasporto merce)</option>
                  <option value="supplier">Fornitore di servizi (officina, telonaio, gommista...)</option>
                </select>
                <p className="text-xs text-neutral-300/70">
                  Il ruolo determina la tua dashboard e i permessi disponibili.
                </p>
              </div>

              <div className="form-actions justify-between">
                <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto">
                  {isPending ? "Creazione in corso..." : "Crea account"}
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
                <span>Trasportatore: cerca carichi e servizi per il mezzo. Azienda: pubblica richieste di trasporto. Fornitore: risponde alle richieste di Borsa Servizi.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">WhatsApp</span>
                <span>I trasportatori ricevono un messaggio appena viene pubblicato un nuovo carico, senza dover controllare la piattaforma.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">Costi</span>
                <span>Iscrizione e abbonamento gratuiti. Una commissione del 2% solo quando sblocchi il contatto di un carico.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">Contatti</span>
                <span>Verificati e diretti, senza call center o intermediari.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">Supporto</span>
                <span>Assistenza via dashboard per verifiche e aggiornamenti account.</span>
              </li>
            </ul>
            <div className="rounded-xl border border-steel-200 bg-white px-4 py-3 text-sm text-neutral-600">
              Dopo la registrazione verrai indirizzato alla dashboard corrispondente al tuo ruolo.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
