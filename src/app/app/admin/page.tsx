import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/commission";
import { routeForUser } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect(routeForUser({ role: user.role, onboardingCompleted: user.onboardingCompleted }));
  }

  const [users, requests] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.request.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#0f172a]">Dashboard Admin</h1>
        <p className="text-sm leading-relaxed text-[#475569]">Supervisione delle attività utenti e richieste.</p>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold text-[#0f172a]">Utenti</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] divide-y divide-[#e2e8f0] text-left text-sm text-[#0f172a]">
            <thead className="bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#475569]">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Ruolo</th>
                <th className="px-4 py-3">Onboarding</th>
                <th className="px-4 py-3">Commissione</th>
                <th className="px-4 py-3">Creato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-sm text-[#0f172a]">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-medium">{item.email}</td>
                  <td className="px-4 py-3 text-[#475569]">{item.role}</td>
                  <td className="px-4 py-3 text-[#475569]">N/D</td>
                  <td className="px-4 py-3 text-[#475569]">Commissione per richiesta</td>
                  <td className="px-4 py-3 text-[#475569]">{new Date(item.createdAt).toLocaleDateString("it-IT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold text-[#0f172a]">Richieste</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] divide-y divide-[#e2e8f0] text-left text-sm text-[#0f172a]">
            <thead className="bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#475569]">
              <tr>
                <th className="px-4 py-3">Richiesta</th>
                <th className="px-4 py-3">Valore</th>
                <th className="px-4 py-3">Azienda</th>
                <th className="px-4 py-3">Pubblicata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-sm text-[#0f172a]">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-semibold">Richiesta #{request.id}</td>
                  <td className="px-4 py-3 text-[#475569]">{formatCurrency(request.priceCents)}</td>
                  <td className="px-4 py-3 text-[#475569]">{request.companyId}</td>
                  <td className="px-4 py-3 text-[#475569]">{new Date(request.createdAt).toLocaleDateString("it-IT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
