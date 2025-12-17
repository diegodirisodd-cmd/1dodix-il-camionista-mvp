import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DodiX – Il Camionista",
  description: "MVP logistico con home, autenticazione di base e percorsi principali.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <div className="app-shell">
          <header className="app-header">
            <nav className="app-nav" aria-label="Navigazione principale">
              <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-surface-muted font-bold shadow-card">
                  DX
                </span>
                <div className="leading-tight">
                  <div className="text-sm text-neutral-200">DodiX</div>
                  <div className="text-base text-white">Il Camionista</div>
                </div>
              </div>
              <Link href="/">Home</Link>
              <Link href="/login">Accedi</Link>
              <Link href="/register">Registrati</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/dashboard/transporter">Area Trasportatore</Link>
              <Link href="/dashboard/transporter/requests">Richieste</Link>
              <Link href="/dashboard/company">Area Azienda</Link>
            </nav>
          </header>
          <main className="app-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
