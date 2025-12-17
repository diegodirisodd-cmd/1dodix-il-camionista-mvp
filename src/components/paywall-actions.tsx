"use client";

import { useState } from "react";

export function PaywallActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Impossibile avviare il pagamento");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url as string;
      } else {
        setError("URL di checkout non disponibile");
        setLoading(false);
      }
    } catch (err) {
      setError("Errore durante l'avvio del pagamento");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-md bg-indigo-600 px-4 py-3 text-center text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {loading ? "Reindirizzamento in corso..." : "Abbonati ora"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
