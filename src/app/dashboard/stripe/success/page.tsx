"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StripeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestIdParam = searchParams.get("requestId");
  const roleParam = searchParams.get("role");

  useEffect(() => {
    const requestId = Number(requestIdParam);
    const role = roleParam === "company" ? "COMPANY" : roleParam === "transporter" ? "TRANSPORTER" : null;

    if (!Number.isFinite(requestId) || !role) {
      return;
    }

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

    const detailPath =
      role === "COMPANY"
        ? `/dashboard/company/requests/${requestId}`
        : `/dashboard/transporter/requests/${requestId}`;

    const timer = window.setTimeout(() => {
      router.push(detailPath);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [requestIdParam, roleParam, router]);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
        <p className="font-semibold">Pagamento completato. I contatti sono ora disponibili.</p>
        <p className="text-sm text-[#475569]">Stai per tornare al dettaglio della richiesta.</p>
      </div>
    </section>
  );
}
