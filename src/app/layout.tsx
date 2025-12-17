import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
        <div className="min-h-screen text-neutral-50">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-muted/80 backdrop-blur-lg">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500 text-lg font-black tracking-tight text-brand-900 shadow-lg shadow-accent-500/30">
                  DX
                </div>
                <div className="leading-tight">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-200">DodiX</div>
                  <div className="text-xl font-semibold text-white">Il Camionista</div>
                </div>
              </Link>

              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
                <Link href="/" className="hidden sm:inline-flex rounded-lg px-3 py-2 transition hover:bg-white/10">
                  Home
                </Link>
                {sessionUser ? (
                  <>
                    <Link href="/dashboard" className="inline-flex rounded-lg px-3 py-2 transition hover:bg-white/10">
                      Dashboard
                    </Link>
                    <span className="hidden rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-accent-100 sm:inline-flex">
                      {sessionUser.role}
                    </span>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="inline-flex rounded-lg px-3 py-2 transition hover:bg-white/10">
                      Accedi
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex rounded-lg border border-accent-400/70 bg-accent-500/90 px-4 py-2 text-brand-900 shadow-lg shadow-accent-500/30 transition hover:-translate-y-0.5 hover:bg-accent-500"
                    >
                      Registrati
                    </Link>
                  </>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:px-6">
            {sessionUser && (
              <aside className="hidden w-64 shrink-0 lg:block">
                <nav
                  className="sticky top-24 flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-neutral-100 shadow-card backdrop-blur"
                  aria-label="Menu laterale"
                >
                  <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-[11px] uppercase tracking-wide text-neutral-300">
                    Navigazione
                  </div>
                  <div className="flex flex-col px-1 pb-2 pt-2">
                    {sidebarLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/10 hover:text-white"
                      >
                        <span className="h-2 w-2 rounded-full bg-accent-400 shadow shadow-accent-500/30" aria-hidden />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              </aside>
            )}

            <main className="flex-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur lg:p-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
