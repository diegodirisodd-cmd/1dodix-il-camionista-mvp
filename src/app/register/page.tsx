"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Registrazione non riuscita.");
      return;
    }

    setResult("Account creato con successo.");
    router.replace("/dashboard");
  };

  return (
    <section className="max-w-2xl space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Onboarding</p>
        <h1>Registrati</h1>
        <p>Apri un account con email, password e ruolo operativo (Transporter o Company).</p>
      </header>

      <div className="card space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input className="input-field" id="email" name="email" type="email" required />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input className="input-field" id="password" name="password" type="password" minLength={6} required />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="role">
              Ruolo
            </label>
            <select className="input-field" id="role" name="role" required defaultValue="">
              <option value="" disabled>
                Seleziona un ruolo
              </option>
              <option value="transporter">Transporter</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div className="form-actions justify-between">
            <button type="submit" className="btn-primary">
              Crea account
            </button>
            <span className="text-sm text-neutral-700">
              Hai già un account? <Link className="text-brand-700" href="/login">Accedi</Link>
            </span>
          </div>
        </form>

        {result && <p className="alert-success" aria-live="polite">{result}</p>}
        {error && (
          <p className="alert-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
