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
      setError(data.error ?? "Accesso non riuscito.");
      return;
    }

    const roleInfo = data.role ? ` (ruolo: ${data.role.toLowerCase()})` : "";
    setResult(`${data.message ?? "Accesso eseguito."}${roleInfo}`);
    router.replace("/dashboard");
  };

  return (
    <section className="max-w-xl space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Accesso</p>
        <h1>Accedi</h1>
        <p>Inserisci email e password per accedere alla tua area operativa.</p>
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
            <input className="input-field" id="password" name="password" type="password" required />
          </div>

          <div className="form-actions justify-between">
            <button type="submit" className="btn-primary">
              Accedi
            </button>
            <span className="text-sm text-neutral-700">
              Non hai un account? <Link className="text-brand-700" href="/register">Registrati</Link>
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
