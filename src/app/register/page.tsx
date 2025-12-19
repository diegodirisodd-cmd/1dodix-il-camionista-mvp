"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

import { actionRegister } from "@/app/actions/auth";

export default function RegisterPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setResult(null);
    setError(null);

    startTransition(async () => {
      const response = await actionRegister(formData);

      if (response.error) {
        setError(response.error);
        return;
      }

      setResult("Account creato con successo. Accedi per continuare.");
      router.replace("/login");
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
          Crea un account con email, password e ruolo operativo per accedere a richieste e contatti. L&apos;abbonamento è richiesto
          per l&apos;uso della piattaforma.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card-contrast space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-50">Dati account</h3>
            <p className="text-sm text-neutral-100/80">
              Compila i campi obbligatori. Gli errori saranno evidenziati per permetterti di correggere velocemente.
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
            <div className="form-field">
              <label className="label" htmlFor="name">
                Nome o ragione sociale
              </label>
              <input className="input-field" id="name" name="name" type="text" required autoComplete="organization" />
              <p className="text-xs text-neutral-100/70">Inserisci il nominativo con cui operi sulla piattaforma.</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input className="input-field" id="email" name="email" type="email" required autoComplete="email" />
              <p className="text-xs text-neutral-100/70">Usa un indirizzo aziendale valido: verrà usato per gli avvisi e il login.</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                className="input-field"
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-neutral-100/70">Almeno 6 caratteri. Mantieni la password protetta.</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="phone">
                Telefono (opzionale)
              </label>
              <input className="input-field" id="phone" name="phone" type="tel" autoComplete="tel" />
              <p className="text-xs text-neutral-100/70">Verrà usato per i contatti diretti. Puoi aggiornarlo in seguito.</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="operatingArea">
                Area operativa
              </label>
              <input
                className="input-field"
                id="operatingArea"
                name="operatingArea"
                type="text"
                required
                placeholder="Es. Nord Italia, Lombardia"
              />
              <p className="text-xs text-neutral-100/70">Indica l&apos;area geografica in cui operi abitualmente.</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="role">
                Ruolo
              </label>
              <select className="input-field" id="role" name="role" required defaultValue="">
                <option value="" disabled>
                  Seleziona un ruolo
                </option>
                <option value="company">Azienda</option>
                <option value="transporter">Trasportatore</option>
              </select>
              <p className="text-xs text-neutral-100/70">
                Il ruolo guida la navigazione (dashboard azienda o trasportatore) e i permessi disponibili.
              </p>
            </div>

            <div className="form-actions justify-between">
              <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto">
                {isPending ? "Creazione in corso..." : "Crea account"}
              </button>
              <span className="text-sm text-neutral-100/80">
                Hai già un account? <Link className="text-accent-200 underline" href="/login">Accedi</Link>
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
              <span>È obbligatorio per accedere ai contatti e ai dati sensibili.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="badge">Supporto</span>
              <span>Assistenza via dashboard per verifiche e aggiornamenti account.</span>
            </li>
          </ul>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-100/80">
            Dopo la registrazione verrai indirizzato alla dashboard: da lì potrai completare l&apos;abbonamento Stripe se non è già
            attivo.
          </div>
        </div>
      </div>
    </section>
  );
}
