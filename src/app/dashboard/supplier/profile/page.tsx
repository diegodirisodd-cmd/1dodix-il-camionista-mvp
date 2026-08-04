import Link from "next/link";
import { redirect } from "next/navigation";

import { SupplierProfileForm } from "@/components/services/supplier-profile-form";
import { getSessionUser } from "@/lib/auth";

export default async function SupplierProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "SUPPLIER") {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <div className="card animate-fadeUp space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Profilo fornitore</p>
        <h1>Servizi offerti e zone servite</h1>
        <p className="max-w-2xl">
          Le richieste che ti arrivano dipendono da queste impostazioni: ricevi una notifica solo quando
          un cliente pubblica una richiesta in una categoria e in una provincia che copri.
        </p>
      </div>

      <SupplierProfileForm />

      <div>
        <Link href="/dashboard/supplier" className="btn-ghost">
          ← Torna alla panoramica
        </Link>
      </div>
    </section>
  );
}
