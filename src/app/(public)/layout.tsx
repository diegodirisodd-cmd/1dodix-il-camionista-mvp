import Image from "next/image";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { getSessionUser } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();
  const initials = sessionUser?.email?.slice(0, 2).toUpperCase() ?? "DX";

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#0f172a]">
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
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
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-3 text-sm font-semibold">
            {sessionUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#475569] shadow-sm sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b3c5d] text-white font-semibold">
                    {initials}
                  </span>
                  <span className="text-sm font-semibold text-[#0f172a]">{sessionUser.email}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="hidden items-center gap-2 rounded-lg bg-[#0b3c5d] px-4 py-2 text-white shadow-sm transition hover:bg-[#0a3552] sm:inline-flex"
                >
                  Dashboard
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="hidden items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-[#0f172a] shadow-sm transition hover:bg-slate-100 sm:inline-flex"
                >
                  Home
                </Link>
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
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
