import { redirect } from "next/navigation";

import { RequestDetailView } from "@/components/requests/request-detail-view";
import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import { type Role } from "@/lib/roles";

type RequestDetailPageProps = {
  requestId: number;
  backHref: string;
};

function getContactEmail({
  role,
  companyEmail,
  transporterEmail,
}: {
  role: Role;
  companyEmail: string;
  transporterEmail: string | null;
}) {
  if (role === "TRANSPORTER") return companyEmail;
  if (role === "COMPANY") return transporterEmail;
  return companyEmail;
}

function getContactPhone({
  role,
  companyPhone,
  transporterPhone,
}: {
  role: Role;
  companyPhone: string | null;
  transporterPhone: string | null;
}) {
  if (role === "TRANSPORTER") return companyPhone;
  if (role === "COMPANY") return transporterPhone;
  return companyPhone;
}

export async function RequestDetailPage({ requestId, backHref }: RequestDetailPageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!Number.isFinite(requestId)) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#0f172a]">Richiesta non valida</h1>
        <p className="text-sm text-[#475569]">L&apos;identificativo della richiesta non è valido.</p>
      </section>
    );
  }

  if (!["COMPANY", "TRANSPORTER", "ADMIN"].includes(user.role)) {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const requestRecord = await prisma.request.findUnique({
    where: { id: requestId },
    include: { company: true, transporter: true },
  });

  if (!requestRecord) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#0f172a]">Richiesta non trovata</h1>
        <p className="text-sm text-[#475569]">La richiesta non esiste oppure non è più disponibile.</p>
      </section>
    );
  }

  const status = requestRecord.status;
  const contactVisible =
    user.role === "ADMIN"
      ? true
      : user.role === "COMPANY"
        ? status === "ACCEPTED"
        : requestRecord.contactsUnlockedByTransporter;

  const assignedToSelf = user.role === "TRANSPORTER" && requestRecord.transporterId === user.id;
  const assignedToOther =
    user.role === "TRANSPORTER" &&
    requestRecord.transporterId !== null &&
    requestRecord.transporterId !== user.id;

  return (
    <RequestDetailView
      requestId={requestRecord.id}
      title={requestRecord.title}
      description={requestRecord.description}
      priceCents={requestRecord.price}
      createdAt={requestRecord.createdAt.toISOString()}
      contactEmail={getContactEmail({
        role: user.role,
        companyEmail: requestRecord.company.email,
        transporterEmail: requestRecord.transporter?.email ?? null,
      })}
      contactPhone={getContactPhone({
        role: user.role,
        companyPhone: requestRecord.company.phone ?? null,
        transporterPhone: requestRecord.transporter?.phone ?? null,
      })}
      role={user.role}
      unlocked={contactVisible}
      backHref={backHref}
      status={status}
      transporterId={requestRecord.transporterId ?? null}
      assignedToSelf={assignedToSelf}
      assignedToOther={assignedToOther}
    />
  );
}
