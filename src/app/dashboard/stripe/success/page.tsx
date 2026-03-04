"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DashboardStripeSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestIdParam = searchParams.get("requestId");
  const roleParam = searchParams.get("role");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const requestId = Number(requestIdParam);
    const role =
      roleParam === "company" ? "COMPANY" : roleParam === "transporter" ? "TRANSPORTER" : null;

    if (!Number.isFinite(requestId) || !role) {
      setStatus("error");
      setErrorMessage("Parametri mancanti o non validi. Controlla il link e riprova.");
      return;
    }

    try {
      const stored = window.localStorage.getItem("unlockedRequests");
      let parsed: { COMPANY?: number[]; TRANSPORTER?: number[] } = {};
      try {
        parsed = stored ? (JSON.parse(stored) as { COMPANY?: number[]; TRANSPORTER?: number[] }) : {};
      } catch {
        parsed = {};
      }

      const list = role === "COMPANY" ? parsed.COMPANY ?? [] : parsed.TRANSPORTER ?? [];
      if (!list.includes(requestId)) {
        const next = [...list, requestId];
        if (role === "COMPANY") {
          parsed.COMPANY = next;
        } else {
          parsed.TRANSPORTER = next;
        }
        window.localStorage.setItem("unlockedRequests", JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn("localStorage non disponibile:", e);
    }

    const detailPath =
      role === "COMPANY"
        ? `/dashboard/company/requests/${requestId}`
        : `/dashboard/transporter/requests/${requestId}`;

    setStatus("success");

    const timer = window.setTimeout(() => {
      router.push(detailPath);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [requestIdParam, roleParam, router]);

  if (status === "loading") {
    return (
      <section className="space-y-4 p-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <p className="font-semibold">Conferma pagamento in corso...</p>
          <p className="mt-1 text-blue-600">Attendere, non chiudere questa pagina.</p>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="space-y-4 p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Errore</p>
          <p className="mt-1">{errorMessage}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => router.push("/dashboard")}
        >
          Torna alla dashboard
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4 p-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
        <p className="font-semibold">Pagamento completato. I contatti sono ora disponibili.</p>
        <p className="mt-1 text-emerald-600">Verrai reindirizzato automaticamente tra pochi secondi...</p>
      </div>
      <button
        type="button"
        className="btn-primary"
        onClick={() => {
          const requestId = Number(requestIdParam);
          const role =
            roleParam === "company" ? "COMPANY" : roleParam === "transporter" ? "TRANSPORTER" : null;
          const path =
            role === "COMPANY"
              ? `/dashboard/company/requests/${requestId}`
              : `/dashboard/transporter/requests/${requestId}`;
          router.push(path);
        }}
      >
        Vai ai dettagli ora
      </button>
    </section>
  );
}

export default function StripeSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-4 p-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <p className="font-semibold">Caricamento...</p>
          </div>
        </section>
      }
    >
      <DashboardStripeSuccessContent />
    </Suspense>
  );
}
