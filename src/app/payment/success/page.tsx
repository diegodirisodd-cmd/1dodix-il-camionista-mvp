import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams?: { requestId?: string; role?: string };
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const requestId = Number(searchParams?.requestId);
  const role = searchParams?.role;

  if (!Number.isFinite(requestId) || (role !== "COMPANY" && role !== "TRANSPORTER")) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#0f172a]">Pagamento non valido</h1>
        <p className="text-sm text-[#475569]">Dettagli mancanti per completare lo sblocco contatti.</p>
        <Link href="/dashboard" className="btn-primary">
          Torna alla dashboard
        </Link>
      </section>
    );
  }

  if (user.role !== role) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#0f172a]">Accesso non autorizzato</h1>
        <p className="text-sm text-[#475569]">Non puoi completare questo sblocco con il profilo attuale.</p>
        <Link href="/dashboard" className="btn-primary">
          Torna alla dashboard
        </Link>
      </section>
    );
  }

  // The Stripe webhook is the source of truth for unlock state.
  // No DB writes here — the URL is user-controlled and would otherwise allow tampering.
  const detailHref =
    role === "COMPANY"
      ? `/dashboard/company/requests/${requestId}`
      : `/dashboard/transporter/requests/${requestId}`;

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
        <p className="font-semibold">Pagamento ricevuto</p>
        <p className="text-sm text-[#475569]">
          Lo sblocco viene confermato automaticamente da Stripe. Se non vedi i contatti, ricarica la pagina tra qualche secondo.
        </p>
      </div>
      <Link href={detailHref} className="btn-primary">
        Torna alla richiesta
      </Link>
    </section>
  );
}
