"use client";

import clsx from "clsx";
import { useState } from "react";

type ActionButtonProps = {
  label: string;
  url: string;
  method?: "POST" | "PATCH";
  body?: unknown;
  /** Se presente, il primo click mostra questa domanda e i pulsanti Conferma/Annulla. */
  confirm?: string;
  confirmLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  /** Chiamata con la risposta JSON quando la richiesta va a buon fine. */
  onDone?: (data: Record<string, unknown>) => void;
};

/**
 * Pulsante che chiama un'API e aggiorna la pagina. Sostituisce i vecchi
 * window.confirm / alert: la conferma e gli errori compaiono in linea.
 * Se l'API risponde con { url } (checkout Stripe) apre quella pagina.
 */
export function ActionButton({
  label,
  url,
  method = "POST",
  body,
  confirm,
  confirmLabel = "Conferma",
  variant = "primary",
  className,
  onDone,
}: ActionButtonProps) {
  const [asking, setAsking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = ((await res.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Operazione non riuscita. Riprova.");
        setLoading(false);
        return;
      }
      if (typeof data.url === "string") {
        window.location.href = data.url;
        return;
      }
      setAsking(false);
      onDone?.(data);
      window.location.reload();
    } catch {
      setError("Connessione non riuscita. Riprova.");
    }
    setLoading(false);
  }

  const cls = clsx(
    "min-h-[44px]",
    variant === "primary" && "btn-primary",
    variant === "secondary" && "btn-secondary",
    variant === "ghost" && "btn-ghost",
    variant === "danger" &&
      "inline-flex items-center justify-center rounded-lg border border-danger/40 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10",
    className,
  );

  return (
    <div className="space-y-2">
      {asking ? (
        <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-textStrong">
          <p>{confirm}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={cls} onClick={run} disabled={loading}>
              {loading ? "Attendere..." : confirmLabel}
            </button>
            <button type="button" className="btn-ghost min-h-[44px]" onClick={() => setAsking(false)} disabled={loading}>
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={cls}
          onClick={() => (confirm ? setAsking(true) : run())}
          disabled={loading}
        >
          {loading ? "Attendere..." : label}
        </button>
      )}
      {error && (
        <p className="alert-danger text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
