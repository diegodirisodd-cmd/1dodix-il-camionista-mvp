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
    <section className="grid min-h-screen grid-cols-1 bg-gradient-to-br from-[#0f2a44] via-[#132d46] to-[#0f172a] text-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden px-12 py-16 lg:block">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.1),transparent_30%)]" />
        </div>
        <div className="relative mx-auto flex h-full max-w-2xl flex-col justify-between space-y-10">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">
              DodiX – Il Camionista
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white">Accesso sicuro alla tua operatività</h1>
              <p className="text-lg text-white/80">
                Gestisci richieste, contatti e abbonamento con un&apos;esperienza pensata per team di trasporto e aziende che cercano affidabilità.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-xl shadow-black/30 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Perché accedere ora</h3>
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
        <div className="w-full max-w-[420px] space-y-6 rounded-2xl border border-neutral-200 bg-white/95 p-8 text-neutral-900 shadow-xl shadow-black/10">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0f2a44]">Accesso</p>
            <h2 className="text-3xl font-semibold text-[#0f2a44]">Accedi al pannello</h2>
            <p className="text-sm text-neutral-600">
              Inserisci email aziendale e password per continuare. L&apos;abbonamento è obbligatorio per usare la piattaforma.
            </p>
          </div>

          {result && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" aria-live="polite">
              {result}
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-800" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-[#0f2a44] focus:outline-none focus:ring-2 focus:ring-[#0f2a44]/30"
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              <p className="text-xs text-neutral-500">Usa l&apos;indirizzo aziendale verificato.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-800" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-[#0f2a44] focus:outline-none focus:ring-2 focus:ring-[#0f2a44]/30"
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
              <p className="text-xs text-neutral-500">Minimo 6 caratteri. Non condividere la password.</p>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#0f2a44] text-sm font-semibold text-white shadow-md transition duration-150 hover:bg-[#13375a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2a44] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Accedi
              </button>
              <Link
                href="/register"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-[#0f2a44]/20 bg-emerald-50 text-sm font-semibold text-[#0f2a44] transition duration-150 hover:border-[#0f2a44]/40 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2a44] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Non hai un account? Registrati
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
