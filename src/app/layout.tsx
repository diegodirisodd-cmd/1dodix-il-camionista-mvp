import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { getSessionUser } from "@/lib/auth";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DodiX – Il Camionista",
  description: "SaaS logistico B2B per aziende e trasportatori con controlli di accesso, richieste strutturate e contatti verificati.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();
  const role = sessionUser?.role;
  const dashboardHome =
    role === "ADMIN"
      ? "/dashboard/admin"
      : role === "COMPANY"
        ? "/dashboard/company"
        : role === "TRANSPORTER"
          ? "/dashboard/transporter"
          : "/dashboard";
  const requestsLink =
    role === "ADMIN"
      ? "/dashboard/admin#richieste"
      : role === "COMPANY"
        ? "/dashboard/company"
        : role === "TRANSPORTER"
          ? "/dashboard/transporter/requests"
          : "/dashboard";
  const peerLink =
    role === "ADMIN"
      ? "/dashboard/admin#utenti"
      : role === "COMPANY"
        ? "/dashboard/company"
        : role === "TRANSPORTER"
          ? "/dashboard/transporter"
          : "/dashboard";

  const sidebarLinks = sessionUser
    ? [
        { label: "Dashboard", href: dashboardHome },
        { label: "Richieste", href: requestsLink },
        role === "ADMIN"
          ? { label: "Panoramica admin", href: "/dashboard/admin" }
          : {
              label: "Trasportatori / Aziende",
              href: role === "COMPANY" ? peerLink : role === "TRANSPORTER" ? peerLink : "/dashboard",
            },
        { label: "Abbonamento", href: "/paywall" },
        { label: "Impostazioni", href: "/dashboard" },
      ]
    : [];

  const headerNav = sessionUser
    ? [
        { label: "Home", href: "/" },
        { label: "Dashboard", href: dashboardHome },
        {
          label: "Richieste",
          href: requestsLink,
        },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Per aziende", href: "/#aziende" },
        { label: "Per trasportatori", href: "/#trasportatori" },
      ];

  return (
    <html lang="it">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#f8fafc] text-slate-900">
          <header className="sticky top-0 z-40 border-b border-[#e2e8f0] bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-100">
                  <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 shadow-sm">
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
                      <div className="text-[11px] uppercase tracking-[0.28em] text-slate-600">DodiX</div>
                      <div className="text-xl font-semibold text-slate-900">Il Camionista</div>
                    </div>
                  </div>
                </Link>

                {sessionUser && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800 shadow-sm sm:hidden">
                    <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                    {sessionUser.role}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-1 lg:justify-end">
                <nav
                  className="flex flex-1 items-center gap-1 rounded-xl border border-[#e2e8f0] bg-white px-2 py-2 text-sm font-semibold text-slate-800 shadow-sm lg:flex-none"
                  aria-label="Navigazione principale"
                >
                  <div className="flex flex-1 items-center gap-1 overflow-x-auto px-1 sm:justify-center">
                    {headerNav.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.label === "Dashboard" && sessionUser ? "bg-[#0f172a]" : "bg-slate-300"
                          }`}
                          aria-hidden
                        />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  {sessionUser ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#0f172a] px-4 py-2 text-white shadow-sm transition hover:bg-slate-800"
                      >
                        <span className="h-2 w-2 rounded-full bg-success" aria-hidden /> Panoramica
                      </Link>
                      <span className="hidden rounded-lg border border-[#e2e8f0] bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-700 sm:inline-flex">
                        {sessionUser.role}
                      </span>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 transition hover:bg-slate-100"
                      >
                        Accedi
                      </Link>
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#0f172a] px-4 py-2 text-white shadow-sm transition hover:bg-slate-800"
                      >
                        Registrati
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:px-6">
            {sessionUser && (
              <aside className="hidden w-64 shrink-0 lg:block">
                <nav
                  className="sticky top-24 flex flex-col gap-1 rounded-xl border border-[#e2e8f0] bg-white p-3 text-sm font-semibold text-slate-800 shadow-sm"
                  aria-label="Menu laterale"
                >
                  <div className="rounded-lg border border-[#e2e8f0] bg-slate-50 px-3 py-3 text-[11px] uppercase tracking-wide text-slate-600">
                    Navigazione
                  </div>
                  <div className="flex flex-col px-1 pb-2 pt-2">
                    {sidebarLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#0f172a]" aria-hidden />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              </aside>
            )}

            <main className="flex-1">
              <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm lg:p-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
