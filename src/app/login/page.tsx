"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const highlights = [
  "Avviso WhatsApp appena esce un carico",
  "Candidarsi è gratis: il 2% solo se l'azienda ti sceglie e confermi",
  "Contatto diretto con chi spedisce, senza intermediari",
  "Officine e fornitori per il mezzo nella Borsa Servizi",
];

export default function LoginPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setResult(null);
    setError(null);

    startTransition(async () => {
      try {
        const payload = Object.fromEntries(formData.entries());

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data?.error ?? "Email o password non valide");
          return;
        }

        setResult("Accesso eseguito.");
        // Dopo il login si torna alla pagina richiesta (es. link da WhatsApp/email).
        const next = new URLSearchParams(window.location.search).get("next");
        const safeNext = next && next.startsWith("/dashboard") && !next.startsWith("//") ? next : null;
        router.replace(safeNext ?? data?.redirectTo ?? "/dashboard");
      } catch (err) {
        console.error("Errore durante il login", err);
        setError("Accesso non riuscito. Riprova tra qualche istante.");
      }
    });
  };

  return (
    <section className="grid min-h-screen grid-cols-1 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white lg:grid-cols-2">
      <div className="bg-road relative hidden overflow-hidden px-12 py-16 lg:block">
        <div className="absolute inset-0" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(600px_circle_at_20%_15%,rgba(255,106,0,0.18),transparent_60%),radial-gradient(500px_circle_at_85%_80%,rgba(65,112,143,0.22),transparent_60%)]" />
        </div>
        <div className="relative mx-auto flex h-full max-w-3xl items-center justify-center">
          <div className="glass animate-fadeUp space-y-8 p-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">
                DodiX – Il Camionista
              </span>
              <h1 className="text-4xl text-white">Trasporti, senza perdite di tempo</h1>
              <p className="text-base text-neutral-200/85">
                Una piattaforma sola per aziende, trasportatori e fornitori di servizi: pubblica,
                ricevi e gestisci richieste in modo diretto.
              </p>
            </div>
            <ul className="space-y-4 text-base">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-500/40 bg-accent-500/15 text-accent-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="leading-relaxed text-neutral-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="card animate-fadeUp w-full max-w-[440px] space-y-6 p-8 shadow-deep">
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-2 shadow-card">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-brand-900">
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
                  <p className="text-[11px] uppercase tracking-[0.3em] text-accent-600">DodiX</p>
                  <p className="text-lg font-semibold text-textStrong">Il Camionista</p>
                </div>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Accesso</p>
            <h2>Accedi a DodiX</h2>
            <p>La piattaforma che collega aziende, trasportatori e officine.</p>
          </div>

          {result && (
            <p className="alert-success" aria-live="polite">
              {result}
            </p>
          )}
          {error && (
            <div className="alert-danger" role="alert" aria-live="assertive">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 flex-shrink-0"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.75a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm0 7a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <form className="space-y-5" action={handleSubmit}>
            <div className="space-y-2">
              <label className="label" htmlFor="email">
                Email aziendale
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M1.5 8.67v6.66a2.67 2.67 0 002.67 2.67h15.66a2.67 2.67 0 002.67-2.67V8.67L12 13.5 1.5 8.67z" />
                    <path d="M21.5 6.67A2.67 2.67 0 0018.83 4H5.17A2.67 2.67 0 002.5 6.67L12 11.5l9.5-4.83z" />
                  </svg>
                </span>
                <input
                  className="input-field h-12 pl-11"
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-neutral-500">Usa l&apos;indirizzo aziendale verificato.</p>
            </div>

            <div className="space-y-2">
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 2a5 5 0 00-5 5v2H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-2V7a5 5 0 00-5-5zm-3 7V7a3 3 0 116 0v2H9zm3 4a1.5 1.5 0 011.5 1.5 1.5 1.5 0 11-3 0A1.5 1.5 0 0112 13z" />
                  </svg>
                </span>
                <input
                  className="input-field h-12 pl-11"
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-xs text-neutral-500">Minimo 6 caratteri.</p>
                <Link
                  href="/reset-password"
                  className="inline-flex min-h-[44px] items-center text-xs font-semibold text-accent-600 hover:underline"
                >
                  Password dimenticata?
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <button type="submit" disabled={loading} className="btn-primary h-12 w-full gap-2 text-base">
                {loading && (
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {loading ? "Accesso in corso..." : "Accedi alla piattaforma"}
              </button>
              <Link href="/register" className="btn-secondary h-12 w-full">
                Non hai un account? Crea il tuo profilo
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
