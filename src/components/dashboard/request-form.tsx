"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INITIAL_STATE = {
  pickup: "",
  dropoff: "",
  timeWindow: "",
  cargoType: "",
  estimatedWeight: "",
  cargo: "",
  budget: "",
  description: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

export function RequestForm() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Impossibile pubblicare la richiesta");
      return;
    }

    setSuccess("Richiesta pubblicata correttamente");
    setForm(INITIAL_STATE);
    router.push("/dashboard/company?created=1");
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span className="label">Ritiro*</span>
          <input
            required
            className="input-field"
            value={form.pickup}
            onChange={(e) => updateField("pickup", e.target.value)}
            placeholder="Bergamo (BG)"
          />
        </label>
        <label className="form-field">
          <span className="label">Consegna*</span>
          <input
            required
            className="input-field"
            value={form.dropoff}
            onChange={(e) => updateField("dropoff", e.target.value)}
            placeholder="Verona (VR)"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span className="label">Data o finestra oraria*</span>
          <input
            required
            className="input-field"
            value={form.timeWindow}
            onChange={(e) => updateField("timeWindow", e.target.value)}
            placeholder="12 marzo, fascia mattina"
          />
        </label>
        <label className="form-field">
          <span className="label">Tipo di carico*</span>
          <input
            required
            className="input-field"
            value={form.cargoType}
            onChange={(e) => updateField("cargoType", e.target.value)}
            placeholder="Alimentari, pallet, ADR, ecc."
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span className="label">Peso/volume stimato*</span>
          <input
            required
            className="input-field"
            value={form.estimatedWeight}
            onChange={(e) => updateField("estimatedWeight", e.target.value)}
            placeholder="Es. 8 pallet / 12 ql"
          />
        </label>
        <label className="form-field">
          <span className="label">Descrizione (opzionale)</span>
          <textarea
            className="input-field"
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Note di accesso, orari di carico, ecc."
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="form-field">
          <span className="label">Referente*</span>
          <input
            required
            className="input-field"
            value={form.contactName}
            onChange={(e) => updateField("contactName", e.target.value)}
            placeholder="Nome Cognome"
          />
        </label>
        <label className="form-field">
          <span className="label">Telefono*</span>
          <input
            required
            className="input-field"
            value={form.contactPhone}
            onChange={(e) => updateField("contactPhone", e.target.value)}
            placeholder="+39 333 0000000"
          />
        </label>
        <label className="form-field">
          <span className="label">Email*</span>
          <input
            required
            type="email"
            className="input-field"
            value={form.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
            placeholder="logistica@azienda.it"
          />
        </label>
      </div>

      {error && <p className="alert-warning">{error}</p>}
      {success && <p className="alert-success">{success}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Pubblicazione..." : "Pubblica richiesta"}
      </button>
    </form>
  );
}
