"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PhoneForm({ initialPhone }: { initialPhone?: string | null }) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSaving(true);

    const response = await fetch("/api/profile/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    setSaving(false);

    if (!response.ok) {
      setMessage("Impossibile salvare il numero di telefono.");
      return;
    }

    setMessage("Numero di telefono aggiornato.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-[#475569]" htmlFor="phone">
          Telefono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="input-field"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Inserisci il tuo numero"
        />
        <p className="text-xs text-[#64748b]">Il numero sarà visibile alle aziende dopo l&apos;assegnazione.</p>
      </div>
      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
        {saving ? "Salvataggio..." : "Salva numero"}
      </button>
      {message && <p className="text-xs text-[#475569]">{message}</p>}
    </form>
  );
}
