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

  const stylesByVariant: Record<typeof variant, string> = {
    primary: "btn-primary min-h-[44px] px-5 py-3",
    ghost: "btn-ghost min-h-[44px] underline-offset-4 hover:underline",
  };

  const classes = `${stylesByVariant[variant]} ${className}`.trim();

  return (
    <div className="space-y-2">
      <button type="button" className={classes} onClick={triggerCheckout} disabled={loading}>
        {loading ? "Reindirizzamento..." : label}
      </button>
      {variant === "primary" && (
        <p className="text-xs font-medium text-neutral-500">
          Pagamenti sicuri con Stripe • Commissione applicata solo allo sblocco
        </p>
      )}
      {error && (
        <p className="text-xs font-semibold text-danger" role="alert">
          {error} — se il problema persiste apri la pagina fatturazione ({billingDestinationForRole(role)})
        </p>
      )}
    </div>
  );
}
