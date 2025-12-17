"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
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

  return (
    <div style={{ marginTop: "1rem" }}>
      <button type="button" onClick={handleLogout} disabled={submitting}>
        {submitting ? "Uscita in corso..." : "Esci"}
      </button>
      {error && (
        <p role="alert" style={{ color: "#b00020" }}>
          {error}
        </p>
      )}
    </div>
  );
}
