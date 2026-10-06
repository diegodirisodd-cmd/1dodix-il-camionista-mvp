import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { ProfileForm } from "@/components/profile/profile-form";
import { getSessionUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Profilo" };

export default async function ProfilePage({ searchParams }: { searchParams?: { benvenuto?: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const p = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      companyName: true,
      vatNumber: true,
      vatVerified: true,
      city: true,
      province: true,
      vehicleTypes: true,
      serviceRegions: true,
      whatsappOptIn: true,
    },
  });
  if (!p) redirect("/login");
  const welcome = searchParams?.benvenuto === "1";

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
          {welcome ? "Ultimo passo" : `Profilo · ${ROLE_LABELS[p.role] ?? p.role}`}
        </p>
        <h1>{welcome ? "Benvenuto su DodiX" : "Il tuo profilo"}</h1>
        {welcome && p.role === "TRANSPORTER" && (
          <p className="text-sm text-neutral-600">Scegli mezzi e regioni: ci vuole un minuto e ricevi solo i carichi che ti interessano.</p>
        )}
      </div>
      <ProfileForm initial={p} welcome={welcome} />
      <div className="pt-2">
        <LogoutButton variant="light" />
      </div>
    </section>
  );
}
