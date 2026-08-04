import Link from "next/link";
import { redirect } from "next/navigation";

import { ServiceRequestForm } from "@/components/services/service-request-form";
import { getSessionUser } from "@/lib/auth";
import { canRequestServices } from "@/lib/roles";

export default async function NewServiceRequestPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!canRequestServices(user.role)) {
    redirect("/dashboard/services");
  }

  return (
    <section className="space-y-6">
      <div className="card-contrast bg-road animate-fadeUp space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">Borsa Servizi</p>
        <h1 className="text-white">Cerco un servizio</h1>
        <p className="max-w-2xl text-neutral-200/90">
          Descrivi l&apos;intervento che ti serve: la richiesta arriva subito ai fornitori che coprono la
          tua categoria e la tua provincia. Pubblicare non costa nulla.
        </p>
      </div>

      <ServiceRequestForm />

      <div className="flex justify-start">
        <Link href="/dashboard/services" className="btn-ghost">
          ← Torna alla bacheca
        </Link>
      </div>
    </section>
  );
}
