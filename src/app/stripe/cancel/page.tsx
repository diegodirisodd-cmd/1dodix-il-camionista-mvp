"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StripeCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  return (
    <section className="space-y-4">
      <p className="text-sm font-semibold text-[#0f172a]">Pagamento annullato</p>
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
