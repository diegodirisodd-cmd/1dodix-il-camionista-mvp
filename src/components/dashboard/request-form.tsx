"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PaywallModal } from "@/components/paywall-modal";
import { type Role } from "@/lib/roles";

const INITIAL_STATE = {
  pickup: "",
  dropoff: "",
  cargo: "",
  budget: "",
  description: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
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
        ...form,
        contactsUnlockedByCompany: unlockConfirmed,
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
          <span className="label">Tipologia o note sul carico (opzionale)</span>
          <input
            className="input-field"
            value={form.cargo}
            onChange={(e) => updateField("cargo", e.target.value)}
            placeholder="Pallet, alimentari, ADR, ecc."
          />
        </label>
        <label className="form-field">
          <span className="label">Budget (opzionale)</span>
          <input
            className="input-field"
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            placeholder="Es. 750€"
          />
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
