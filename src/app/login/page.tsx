"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    setResult(data.message ?? "Accesso eseguito.");
  };

  return (
    <section>
      <h1>Accedi</h1>
      <p>Inserisci email e password per eseguire l'accesso.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>

        <div className="form-actions">
          <button type="submit">Accedi</button>
          <span>
            Non hai un account? <Link href="/register">Registrati</Link>
          </span>
        </div>
      </form>

      {result && <p aria-live="polite">{result}</p>}
      {error && (
        <p role="alert" style={{ color: "#b00020" }}>
          {error}
        </p>
      )}
    </section>
  );
}
