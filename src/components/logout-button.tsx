"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Logout non riuscito");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (logoutError) {
      setError("Si è verificato un errore inatteso.");
    } finally {
      setSubmitting(false);
    }
  };

  const buttonClass =
    variant === "light"
      ? "inline-flex min-h-[44px] items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/40"
      : "inline-flex min-h-[44px] items-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-textStrong shadow-sm transition-colors duration-150 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-200";

  return (
    <div className="space-y-2">
      <button type="button" onClick={handleLogout} disabled={submitting} className={buttonClass}>
        {submitting ? "Uscita in corso..." : "Esci"}
      </button>
      {error && (
        <p role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
