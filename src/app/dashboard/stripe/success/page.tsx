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
  const [notice, setNotice] = useState<string | null>(null);

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
          const data = (await response.json().catch(() => ({}))) as { applied?: boolean; message?: string | null };
          if (data.applied === false && data.message) setNotice(data.message);
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
    if (status !== "success" || !requestPath || notice) return;

    const timer = window.setTimeout(() => {
      router.push(requestPath);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [status, requestPath, router, notice]);

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
        <div className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
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
      <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-textStrong">
        <p className="font-semibold">{notice ? "Pagamento ricevuto" : "Pagamento completato"}</p>
        <p className="mt-1 text-neutral-600">{notice ?? "Ti riportiamo al carico tra pochi secondi..."}</p>
      </div>
      <button
        type="button"
        className="btn-primary"
        onClick={() =>
          requestPath ? router.push(requestPath) : router.back()
        }
      >
        Torna al carico
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
