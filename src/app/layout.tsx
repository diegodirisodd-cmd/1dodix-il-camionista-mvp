import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DodiX – Il Camionista",
  description: "MVP logistico con home, autenticazione di base e percorsi principali.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <nav className="app-nav" aria-label="Navigazione principale">
              <div style={{ fontWeight: 700 }}>DodiX – Il Camionista</div>
              <Link href="/">Home</Link>
              <Link href="/login">Accedi</Link>
              <Link href="/register">Registrati</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/dashboard/transporter">Area Trasportatore</Link>
              <Link href="/dashboard/company">Area Azienda</Link>
            </nav>
          </header>
          <main className="app-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
