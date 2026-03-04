"use client";

import { useState } from "react";

import { billingDestinationForRole } from "@/lib/subscription";
import { type Role } from "@/lib/roles";

export function CheckoutButton({
  label = "Sblocca contatti",
  className = "",
  variant = "primary",
  role = "COMPANY",
}: {
  label?: string;
  className?: string;
  variant?: "primary" | "ghost";
  role?: Role;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/stripe/unlock", { method: "POST" });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Impossibile avviare il checkout");
      }

      const data = (await response.json()) as { url?: string };

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL di checkout non disponibile");
      }
    } catch (checkoutError) {
      console.error(checkoutError);
      setError((checkoutError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const baseClasses =
    "inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const stylesByVariant: Record<typeof variant, string> = {
    primary:
      "bg-gradient-to-r from-[#f5c76a] to-[#f29f58] text-[#0f172a] shadow-sm hover:brightness-95 focus:ring-[#f5c76a]",
    ghost: "text-[#0f172a] underline-offset-4 hover:underline focus:ring-slate-900",
  };

  const classes = `${baseClasses} ${stylesByVariant[variant]} ${className}`.trim();

  return (
    <div className="space-y-2">
      <button type="button" className={classes} onClick={triggerCheckout} disabled={loading}>
        {loading ? "Reindirizzamento..." : label}
      </button>
      {variant === "primary" && (
        <p className="text-xs font-medium text-[#64748b]">
          Pagamenti sicuri con Stripe • Commissione applicata solo allo sblocco
        </p>
      )}
      {error && (
        <p className="text-xs font-semibold text-red-600" role="alert">
          {error} — se il problema persiste apri la pagina fatturazione ({billingDestinationForRole(role)})
        </p>
      )}
    </div>
  );
}
