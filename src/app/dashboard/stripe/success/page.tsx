"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function StripeSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const requestId = searchParams.get("requestId");
  const role = searchParams.get("role");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const requestPath = useMemo(() => {
    if (!requestId || !role) return null;
    if (role === "company") {
      return `/dashboard/company/requests/${requestId}`;
    }
    if (role === "transporter") {
      return `/dashboard/transporter/requests/${requestId}`;
    }
    return null;
  }, [requestId, role]);

  useEffect(() => {
    if (!sessionId || !requestId || !role) {
      setStatus("error");
      setErrorMessage("Parametri mancanti. Controlla il link e riprova.");
      return;
    }

    let cancelled = false;

    async function confirmPayment() {
      try {
        const response = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            requestId: Number(requestId),
            role,
          }),
        });

        if (cancelled) return;

        if (response.ok) {
          setStatus("success");
        } else {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          setStatus("error");
          setErrorMessage(
            data.error ??
              "Errore nella conferma del pagamento. Il pagamento potrebbe essere stato comunque elaborato."
          );
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            "Errore di rete. Il pagamento potrebbe essere stato elaborato. Torna alla dashboard per verificare."
          );
        }
      }
    }

    void confirmPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId, requestId, role]);

  useEffect(() => {
    if (status !== "success" || !requestPath) return;

    const timer = window.setTimeout(() => {
      router.push(requestPath);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [status, requestPath, router]);

  if (status === "loading") {
    return (
      <section className="space-y-4 p-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <p className="font-semibold">Conferma pagamento in corso...</p>
          <p className="mt-1 text-blue-600">
            Attendere, non chiudere questa pagina.
          </p>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="space-y-4 p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Attenzione</p>
          <p className="mt-1">{errorMessage}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            requestPath
              ? router.push(requestPath)
              : router.push("/dashboard")
          }
        >
          Torna alla dashboard
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4 p-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
        <p className="font-semibold">
          Pagamento completato con successo!
        </p>
        <p className="mt-1 text-emerald-600">
          Verrai reindirizzato automaticamente tra pochi secondi...
        </p>
      </div>
      <button
        type="button"
        className="btn-primary"
        onClick={() =>
          requestPath ? router.push(requestPath) : router.back()
        }
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
      <StripeSuccessContent />
    </Suspense>
  );
}
