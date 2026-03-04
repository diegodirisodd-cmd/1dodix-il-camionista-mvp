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
      ? "inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      : "inline-flex items-center rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3c5d]/15";

  return (
    <div className="space-y-2">
      <button type="button" onClick={handleLogout} disabled={submitting} className={buttonClass}>
        {submitting ? "Uscita in corso..." : "Esci"}
      </button>
      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
