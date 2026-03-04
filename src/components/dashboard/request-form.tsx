"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PaywallModal } from "@/components/paywall-modal";
import { type Role } from "@/lib/roles";

const INITIAL_STATE = {
  pickup: "",
  dropoff: "",
  cargo: "",
  price: "",
  description: "",
};

type RequestFormProps = {
  onSuccessRedirect?: string;
  subscriptionActive?: boolean;
  role?: Role;
  hasFreeQuota?: boolean;
  [key: string]: unknown;
};

export function RequestForm({
  onSuccessRedirect,
  subscriptionActive = false,
  role = "COMPANY",
  hasFreeQuota = false,
}: RequestFormProps) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [unlockConfirmed, setUnlockConfirmed] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState("");
  const router = useRouter();

  const canPublish = subscriptionActive || hasFreeQuota || unlockConfirmed;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!canPublish) {
      setPaywallOpen(true);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup: form.pickup,
        delivery: form.dropoff,
        cargoType: form.cargo,
        description: form.description,
        price: form.price,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Impossibile pubblicare la richiesta");
      return;
    }

    setSuccess("Richiesta pubblicata correttamente");
    setForm(INITIAL_STATE);
    setUnlockConfirmed(false);
    router.push(onSuccessRedirect ?? "/dashboard/requests?created=1");
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const distanceValue = Number(distanceKm);
  const hasEstimate = Number.isFinite(distanceValue) && distanceValue > 0;
  const minBudget = hasEstimate ? distanceValue * 1.2 : 0;
  const maxBudget = hasEstimate ? distanceValue * 1.5 : 0;

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

      <label className="form-field">
        <span className="label">Distanza stimata (km)</span>
        <input
          type="number"
          min="0"
          step="0.1"
          className="input-field"
          value={distanceKm}
          onChange={(e) => setDistanceKm(e.target.value)}
          placeholder="Es. 320"
        />
      </label>

      {hasEstimate && (
        <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
          <p className="font-semibold">💡 Stima budget consigliato</p>
          <p className="mt-1">In base alla distanza indicata, il budget consigliato è:</p>
          <p className="mt-2 font-semibold">Da €{minBudget.toFixed(2)} a €{maxBudget.toFixed(2)}</p>
          <p className="mt-2 text-xs text-slate-600">
            Indicazione basata su 1,20€–1,50€/km. Puoi inserire qualsiasi budget.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span className="label">Tipologia o note sul carico (opzionale)</span>
          <input
            className="input-field"
            value={form.cargo}
            onChange={(e) => updateField("cargo", e.target.value)}
            placeholder="Pallet, alimentari, ADR, ecc."
          />
        </label>
        <label className="form-field">
          <span className="label">Prezzo trasporto (€)</span>
          <input
            type="number"
            className="input-field"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="Es. 750"
          />
          <span className="text-xs text-[#64748b]">
            Commissione applicata solo allo sblocco contatti: 2% + IVA
          </span>
        </label>
      </div>

      <label className="form-field">
        <span className="label">Descrizione (opzionale)</span>
        <textarea
          className="input-field"
          rows={3}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Note di accesso, vincoli, orari preferiti, ecc."
        />
      </label>

      {error && <p className="alert-warning">{error}</p>}
      {success && <p className="alert-success">{success}</p>}

      {!subscriptionActive && (
        <div className="rounded-lg border border-[#f5c76a] bg-[#fffdf7] p-3 text-xs font-medium text-[#475569]">
          <p className="text-[#0f172a]">La pubblicazione oltre la prima richiesta richiede lo sblocco con commissione.</p>
          <p className="text-[#64748b]">La prima richiesta è gratuita, poi puoi sbloccare i contatti per ogni richiesta.</p>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Pubblicazione..." : "Pubblica richiesta"}
      </button>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onConfirm={async () => {
          setUnlockLoading(true);
          setUnlockConfirmed(true);
          setUnlockLoading(false);
          setPaywallOpen(false);
        }}
        loading={unlockLoading}
        role={role}
      />
    </form>
  );
}
