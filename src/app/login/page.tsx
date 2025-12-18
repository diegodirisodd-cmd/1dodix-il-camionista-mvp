"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Accesso non riuscito. Verifica le credenziali.");
      return;
    }

    const roleInfo = data.role ? ` (ruolo: ${data.role.toLowerCase()})` : "";
    setResult(`${data.message ?? "Accesso eseguito."}${roleInfo}`);
    router.replace("/dashboard");
  };

  return (
    <section className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900/70 via-brand-800/60 to-brand-900/80 px-12 py-16 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" aria-hidden />
        <div className="relative mx-auto flex h-full max-w-2xl flex-col justify-between space-y-10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
              DodiX – Il Camionista
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight">Accesso sicuro alla tua operatività</h1>
              <p className="text-lg text-white/80">
                Gestisci richieste, contatti e abbonamento con un&apos;esperienza pensata per team di trasporto e aziende
                che cercano affidabilità.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-brand-900/40 backdrop-blur">
            <h3 className="text-lg font-semibold">Perché accedere ora</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <span className="badge">Richieste</span>
                <span>Pubblica o prendi in carico trasporti con contatti protetti per gli abbonati.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">Dashboard</span>
                <span>Stato operativo, verifiche e abbonamento sempre aggiornati.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge">Supporto</span>
                <span>Indicazioni chiare su verifica profilo e gestione dati sensibili.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="w-full max-w-[420px] space-y-6 rounded-2xl border border-white/10 bg-white/10 p-8 shadow-xl shadow-brand-900/20 backdrop-blur">
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Accesso</p>
            <h2 className="text-2xl font-semibold">Accedi al pannello</h2>
            <p className="text-sm text-neutral-100/80">
              Inserisci email aziendale e password per continuare. L&apos;abbonamento è obbligatorio per usare la piattaforma.
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input className="input-field" id="email" name="email" type="email" required autoComplete="email" />
              <p className="text-xs text-neutral-100/70">Usa l&apos;indirizzo aziendale verificato.</p>
            </div>

            <div className="form-field">
              <label className="label" htmlFor="password">
                Password
              </label>
              <input className="input-field" id="password" name="password" type="password" required autoComplete="current-password" />
              <p className="text-xs text-neutral-100/70">Minimo 6 caratteri. Non condividere la password.</p>
            </div>

            <div className="form-actions justify-between">
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Accedi
              </button>
              <span className="text-sm text-neutral-100/80">
                Non hai un account? <Link className="text-accent-200 underline" href="/register">Registrati</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
