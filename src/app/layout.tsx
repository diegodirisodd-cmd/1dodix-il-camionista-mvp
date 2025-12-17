import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import { getSessionUser } from "@/lib/auth";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DodiX – Il Camionista",
  description: "MVP logistico con home, autenticazione di base e percorsi principali.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();
  const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard" },
    {
      label: "Richieste",
      href: sessionUser?.role === "COMPANY" ? "/dashboard/company" : "/dashboard/transporter/requests",
    },
    {
      label: "Trasportatori / Aziende",
      href: sessionUser?.role === "COMPANY" ? "/dashboard/transporter" : "/dashboard/company",
    },
    { label: "Abbonamento", href: "/paywall" },
    { label: "Impostazioni", href: "/dashboard" },
  ];

  return (
    <html lang="it">
      <body className={inter.className}>
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
          <header className="sticky top-0 z-40 border-b border-brand-800/30 bg-brand-900 text-white shadow-lg">
            <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500 text-lg font-black tracking-tight text-brand-900 shadow-lg shadow-brand-900/20">
                  DX
                </div>
                <div className="leading-tight">
                  <div className="text-sm uppercase tracking-[0.2em] text-accent-100">DodiX</div>
                  <div className="text-xl font-semibold">Il Camionista</div>
                </div>
              </Link>

              <div className="flex items-center gap-4 text-sm font-semibold">
                <Link href="/" className="hidden sm:inline-flex rounded-lg px-3 py-2 text-accent-100 transition hover:bg-white/10">
                  Home
                </Link>
                {sessionUser ? (
                  <>
                    <Link href="/dashboard" className="inline-flex rounded-lg px-3 py-2 text-accent-100 transition hover:bg-white/10">
                      Dashboard
                    </Link>
                    <span className="hidden rounded-lg bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-accent-50 sm:inline-flex">
                      {sessionUser.role}
                    </span>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="inline-flex rounded-lg px-3 py-2 text-accent-100 transition hover:bg-white/10">
                      Accedi
                    </Link>
                    <Link href="/register" className="inline-flex rounded-lg border border-accent-400/60 bg-white px-4 py-2 text-brand-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      Registrati
                    </Link>
                  </>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto flex max-w-screen-2xl gap-6 px-4 py-8 lg:px-6">
            {sessionUser && (
              <aside className="hidden w-64 shrink-0 lg:block">
                <nav className="sticky top-24 flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white shadow-card" aria-label="Menu laterale">
                  <div className="border-b border-neutral-100 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Navigazione
                  </div>
                  <div className="flex flex-col px-2 pb-4">
                    {sidebarLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-brand-50 hover:text-brand-900"
                      >
                        <span className="h-2 w-2 rounded-full bg-accent-500 shadow shadow-accent-500/30" aria-hidden />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              </aside>
            )}

            <main className="flex-1">
              <div className="rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-card backdrop-blur">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
