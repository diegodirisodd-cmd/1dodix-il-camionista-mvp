"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  };

  return (
    <section>
      <h1>Registrati</h1>
      <p>Crea un account con email, password e ruolo (transporter o company).</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={6} required />
        </div>

        <div className="form-field">
          <label htmlFor="role">Ruolo</label>
          <select id="role" name="role" required defaultValue="">
            <option value="" disabled>
              Seleziona un ruolo
            </option>
            <option value="transporter">Transporter</option>
            <option value="company">Company</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit">Crea account</button>
          <span>
            Hai già un account? <Link href="/login">Accedi</Link>
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
