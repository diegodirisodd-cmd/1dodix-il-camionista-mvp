"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
        router.replace(data?.redirectTo ?? "/app");
      } catch (err) {
        console.error("Errore durante il login", err);
        setError("Accesso non riuscito. Riprova tra qualche istante.");
      }
    });
  };

  return (
    <section className="grid min-h-screen grid-cols-1 bg-gradient-to-br from-[#0f2a44] via-[#132d46] to-[#0f172a] text-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden px-12 py-16 lg:block">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.1),transparent_30%)]" />
        </div>
        <div className="relative mx-auto flex h-full max-w-3xl items-center justify-center">
          <div className="space-y-8 rounded-2xl border border-white/15 bg-black/20 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">
                DodiX – Il Camionista
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-white">Trasporti, senza perdite di tempo</h1>
              <p className="text-base text-white/80">
                Soluzione unica per aziende e trasportatori che vogliono pubblicare, ricevere e gestire richieste in modo diretto e affidabile.
              </p>
            </div>
            <ul className="space-y-4 text-base text-white/80">
              {["Pubblica richieste in pochi minuti", "Ricevi offerte da trasportatori verificati", "Gestisci tutto da un'unica dashboard"].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-emerald-200">
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
                  <span className="leading-relaxed text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="w-full max-w-[420px] space-y-6 rounded-2xl border border-neutral-200 bg-white/95 p-8 text-neutral-900 shadow-xl shadow-black/10">
          <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white px-4 py-2 shadow-sm">
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-neutral-100">
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
                    <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">DodiX</p>
                    <p className="text-lg font-semibold text-[#0f2a44]">Il Camionista</p>
                  </div>
                </div>
              </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0f2a44]">Accesso</p>
            <h2 className="text-3xl font-semibold text-[#0f2a44]">Accedi a DodiX</h2>
            <p className="text-sm text-neutral-600">
              La piattaforma che collega aziende e trasportatori in modo semplice e veloce.
            </p>
          </div>

          {result && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" aria-live="polite">
              {result}
            </p>
          )}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert" aria-live="assertive">
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
              <label className="text-sm font-semibold text-neutral-800" htmlFor="email">
                Email aziendale
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M1.5 8.67v6.66a2.67 2.67 0 002.67 2.67h15.66a2.67 2.67 0 002.67-2.67V8.67L12 13.5 1.5 8.67z" />
                    <path d="M21.5 6.67A2.67 2.67 0 0018.83 4H5.17A2.67 2.67 0 002.5 6.67L12 11.5l9.5-4.83z" />
                  </svg>
                </span>
                <input
                  className="w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-3 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-[#0f2a44] focus:outline-none focus:ring-2 focus:ring-[#0f2a44]/40"
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
              <label className="text-sm font-semibold text-neutral-800" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 2a5 5 0 00-5 5v2H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-2V7a5 5 0 00-5-5zm-3 7V7a3 3 0 116 0v2H9zm3 4a1.5 1.5 0 011.5 1.5 1.5 1.5 0 11-3 0A1.5 1.5 0 0112 13z" />
                  </svg>
                </span>
                <input
                  className="w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-3 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-[#0f2a44] focus:outline-none focus:ring-2 focus:ring-[#0f2a44]/40"
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <p className="text-xs text-neutral-500">Minimo 6 caratteri. Non condividere la password.</p>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0f2a44] text-sm font-semibold text-white shadow-md transition duration-150 hover:bg-[#13375a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2a44] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:border disabled:border-[#0f2a44]/30 disabled:bg-[#0f2a44]/60"
              >
                {loading && (
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                {loading ? "Accesso in corso..." : "Accedi alla piattaforma"}
              </button>
              <Link
                href="/register"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-[#0f2a44]/20 bg-emerald-50 text-sm font-semibold text-[#0f2a44] transition duration-150 hover:border-[#0f2a44]/40 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2a44] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Non hai un account? Crea il tuo profilo
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
