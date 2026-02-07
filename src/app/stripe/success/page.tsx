"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function StripeSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const requestId = searchParams.get("requestId");
  const role = searchParams.get("role");

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
    if (!sessionId || !requestId || !role) return;

    const confirm = async () => {
      const response = await fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          requestId: Number(requestId),
          role,
        }),
      });

      if (response.ok && requestPath) {
        router.push(requestPath);
      }
    };

    void confirm();
  }, [requestId, requestPath, role, router, sessionId]);

  return (
    <section className="space-y-4">
      <p className="text-sm font-semibold text-[#0f172a]">Pagamento completato con successo</p>
      <button
        type="button"
        className="btn-primary"
        onClick={() => (requestPath ? router.push(requestPath) : router.back())}
      >
        Torna alla richiesta
      </button>
    </section>
  );
}

export default function StripeSuccessPage() {
  return (
    <Suspense fallback={null}>
      <StripeSuccessContent />
    </Suspense>
  );
}
