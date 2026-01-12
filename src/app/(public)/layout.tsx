import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    redirect(routeForUser({ role: sessionUser.role, onboardingCompleted: sessionUser.onboardingCompleted }));
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#0f172a]">
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-100">
            <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 shadow-sm">
              <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src="/dodix-logo.svg"
                  alt="Logo DodiX"
                  fill
                  sizes="44px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="leading-tight text-left">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[#64748b]">DodiX</div>
                <div className="text-xl font-semibold text-[#0f172a]">Il Camionista</div>
                <p className="mt-1 text-xs text-[#475569]">La piattaforma B2B per spedizioni e trasporti senza intermediari.</p>
              </div>
            </div>
          </Link>

          <div className="flex flex-col items-start gap-2 text-left sm:items-end">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">Accesso riservato</p>
            <p className="text-sm leading-relaxed text-[#475569]">
              Accedi o registrati per pubblicare richieste e contattare trasportatori verificati.
            </p>
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-[#0f172a] shadow-sm transition hover:bg-slate-100"
              >
                Accedi
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-[#f97316] px-4 py-2 text-white shadow-sm transition hover:bg-[#e26512]"
              >
                Registrati
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
