import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  await prisma.request.update({
    where: { id: requestId },
    data: {
      unlockedByCompany: role === "COMPANY" ? true : undefined,
      unlockedByTransporter: role === "TRANSPORTER" ? true : undefined,
    },
  });

  const detailHref =
    role === "COMPANY"
      ? `/dashboard/company/requests/${requestId}`
      : `/dashboard/transporter/requests/${requestId}`;

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#0f172a]">
        <p className="font-semibold">Contatti sbloccati</p>
        <p className="text-sm text-[#475569]">Ora puoi contattare direttamente l&apos;altra parte.</p>
      </div>
      <Link href={detailHref} className="btn-primary">
        Torna alla richiesta
      </Link>
    </section>
  );
}
