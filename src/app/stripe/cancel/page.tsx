"use client";

import { useRouter } from "next/navigation";

export default function StripeCancelPage() {
  const router = useRouter();

  return (
    <section className="space-y-4">
      <p className="text-sm font-semibold text-[#0f172a]">Pagamento annullato</p>
      <button type="button" className="btn-primary" onClick={() => router.back()}>
        Torna alla richiesta
      </button>
    </section>
  );
}
