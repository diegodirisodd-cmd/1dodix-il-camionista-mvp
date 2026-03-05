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
    <section className="space-y-8">
      <header className="space-y-3 text-center">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 shadow-card backdrop-blur">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white/10 shadow-inner">
              <Image
                src="/dodix-logo.svg"
                alt="Logo DodiX"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </div>
            <div className="text-left leading-tight">
              <p className="text-[11px] uppercase tracking-[0.3em] text-accent-200">DodiX</p>
              <p className="text-lg font-semibold text-white">Il Camionista</p>
            </div>
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Onboarding</p>
        <h1>Registrati</h1>
        <p className="mx-auto max-w-3xl text-neutral-100/80">
          Crea un account con i tuoi dati aziendali per accedere a richieste e contatti.
          L&apos;abbonamento Ã¨ richiesto per l&apos;uso della piattaforma.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card-contrast space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-50">Dati account</h3>
            <p className="text-sm text-neutral-100/80">
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
            {/* --- Sezione Dati Personali --- */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-200">Dati personali</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-field">
                <label className="label" htmlFor="firstName">Nome *</label>
                <input className="input-field" id="firstName" name="firstName" type="text" required autoComplete="given-name" />
              </div>
              <div className="form-field">
                <label className="label" htmlFor="lastName">Cognome *</label>
                <input className="input-field" id="lastName" name="lastName" type="text" required autoComplete="family-name" />
              </div>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="email">Email *</label>
              <input className="input-field" id="email" name="email" type="email" required autoComplete="email" />
              <p className="text-xs text-neutral-100/70">Usa un indirizzo aziendale valido: verr&agrave; usato per gli avvisi e il login.</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="password">Password *</label>
              <input className="input-field" id="password" name="password" type="password" minLength={6} required autoComplete="new-password" />
              <p className="text-xs text-neutral-100/70">Almeno 6 caratteri.</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="phone">Telefono</label>
              <input className="input-field" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+39 ..." />
              <p className="text-xs text-neutral-100/70">Verr&agrave; usato per i contatti diretti.</p>
            </div>

            {/* --- Sezione Dati Aziendali --- */}
            <div className="space-y-1 pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-200">Dati aziendali</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="companyName">Ragione sociale *</label>
              <input className="input-field" id="companyName" name="companyName" type="text" required autoComplete="organization" />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="vatNumber">Partita IVA *</label>
              <input className="input-field" id="vatNumber" name="vatNumber" type="text" required placeholder="IT12345678901" pattern="[A-Za-z]{0,2}[0-9]{11,13}" title="Inserisci una partita IVA valida (es. IT12345678901)" />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="contactPerson">Persona di contatto</label>
              <input className="input-field" id="contactPerson" name="contactPerson" type="text" autoComplete="name" />
              <p className="text-xs text-neutral-100/70">Referente per le comunicazioni operative.</p>
            </div>

            {/* --- Sezione Sede --- */}
            <div className="space-y-1 pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-200">Sede operativa</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="address">Indirizzo *</label>
              <input className="input-field" id="address" name="address" type="text" required autoComplete="street-address" placeholder="Via Roma 1" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="form-field sm:col-span-1">
                <label className="label" htmlFor="city">Citt&agrave; *</label>
                <input className="input-field" id="city" name="city" type="text" required autoComplete="address-level2" />
              </div>
              <div className="form-field">
                <label className="label" htmlFor="province">Provincia *</label>
                <input className="input-field" id="province" name="province" type="text" required maxLength={2} placeholder="MI" autoComplete="address-level1" />
              </div>
              <div className="form-field">
                <label className="label" htmlFor="zipCode">CAP *</label>
                <input className="input-field" id="zipCode" name="zipCode" type="text" required pattern="[0-9]{5}" title="Inserisci un CAP valido (5 cifre)" placeholder="20100" autoComplete="postal-code" />
              </div>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="country">Paese</label>
              <select className="input-field" id="country" name="country" defaultValue="IT" autoComplete="country">
                <option value="IT">Italia</option>
                <option value="FR">Francia</option>
                <option value="DE">Germania</option>
                <option value="ES">Spagna</option>
                <option value="AT">Austria</option>
                <option value="CH">Svizzera</option>
              </select>
            </div>

            {/* --- Ruolo --- */}
            <div className="space-y-1 pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-200">Tipo account</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="role">Ruolo *</label>
              <select className="input-field" id="role" name="role" required defaultValue="">
                <option value="" disabled>Seleziona un ruolo</option>
                <option value="company">Azienda (spedisco merce)</option>
                <option value="transporter">Trasportatore (trasporto merce)</option>
              </select>
              <p className="text-xs text-neutral-100/70">
                Il ruolo determina la tua dashboard e i permessi disponibili.
              </p>
            </div>

            <div className="form-actions justify-between">
              <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto">
                {isPending ? "Creazione in corso..." : "Crea account"}
              </button>
              <span className="text-sm text-neutral-100/80">
                Hai gi&agrave; un account?{" "}
                <Link className="text-accent-200 underline" href="/login">Accedi</Link>
              </span>
            </div>
          </form>
        </div>

        <div className="card-muted space-y-4">
          <h3 className="text-lg font-semibold text-brand-50">Guida rapida</h3>
          <ul className="space-y-3 text-sm text-neutral-100/80">
            <li className="flex items-start gap-3">
              <span className="badge">Ruoli</span>
              <span>Trasportatore: ricerca carichi e contatti. Azienda: pubblica richieste e contatta trasportatori verificati.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="badge">Abbonamento</span>
              <span>&Egrave; obbligatorio per accedere ai contatti e ai dati sensibili.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="badge">Supporto</span>
              <span>Assistenza via dashboard per verifiche e aggiornamenti account.</span>
            </li>
          </ul>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-100/80">
            Dopo la registrazione verrai indirizzato alla dashboard: da l&igrave; potrai completare
            l&apos;abbonamento Stripe se non &egrave; gi&agrave; attivo.
          </div>
        </div>
      </div>
    </section>
  );
}
