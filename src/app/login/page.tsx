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
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Accesso</p>
        <h1>Accedi</h1>
        <p className="max-w-3xl text-neutral-100/80">
          Entra nella tua area operativa per gestire richieste, contatti e abbonamento obbligatorio.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card-contrast space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-50">Credenziali</h3>
            <p className="text-sm text-neutral-100/80">
              Usa l&apos;email aziendale registrata e la password scelta. Gli errori vengono evidenziati in modo chiaro.
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

        <div className="card-muted space-y-4">
          <h3 className="text-lg font-semibold text-brand-50">Cosa trovi dopo l&apos;accesso</h3>
          <ul className="space-y-3 text-sm text-neutral-100/80">
            <li className="flex items-start gap-3">
              <span className="badge">Dashboard</span>
              <span>Stato richieste, contatti recenti e controllo abbonamento in tempo reale.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="badge">Richieste</span>
              <span>Pubblica o prendi in carico carichi con contatti protetti per utenti abbonati.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="badge">Supporto</span>
              <span>Indicazioni chiare su verifica profilo e accesso ai dati sensibili.</span>
            </li>
          </ul>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-100/80">
            Abbonamento obbligatorio per continuare: se il pagamento non è attivo, verrai reindirizzato alla pagina dedicata.
          </div>
        </div>
      </div>
    </section>
  );
}
