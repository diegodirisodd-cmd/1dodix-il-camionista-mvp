"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INITIAL_STATE = {
  title: "",
  pickup: "",
  dropoff: "",
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
    router.refresh();
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Titolo*</span>
          <input
            required
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Trasporto pallet nord Italia"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Budget (opzionale)</span>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            placeholder="€800"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Ritiro*</span>
          <input
            required
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.pickup}
            onChange={(e) => updateField("pickup", e.target.value)}
            placeholder="Bergamo (BG)"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Consegna*</span>
          <input
            required
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.dropoff}
            onChange={(e) => updateField("dropoff", e.target.value)}
            placeholder="Verona (VR)"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Carico (opzionale)</span>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.cargo}
            onChange={(e) => updateField("cargo", e.target.value)}
            placeholder="Pallet misti / 10q"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Descrizione (opzionale)</span>
          <textarea
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Note di accesso, orari di carico, ecc."
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Referente*</span>
          <input
            required
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.contactName}
            onChange={(e) => updateField("contactName", e.target.value)}
            placeholder="Nome Cognome"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Telefono*</span>
          <input
            required
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.contactPhone}
            onChange={(e) => updateField("contactPhone", e.target.value)}
            placeholder="+39 333 0000000"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-800">Email*</span>
          <input
            required
            type="email"
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
            placeholder="logistica@azienda.it"
          />
        </label>
      </div>

      {error && <p className="text-sm text-amber-700">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Pubblicazione..." : "Pubblica richiesta"}
      </button>
    </form>
  );
}
