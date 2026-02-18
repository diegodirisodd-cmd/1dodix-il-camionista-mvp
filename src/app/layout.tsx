import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "DodiX – Il Camionista",
  description: "SaaS logistico B2B per aziende e trasportatori con controlli di accesso, richieste strutturate e contatti verificati.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="font-sans bg-[#f5f7fa] text-[#0f172a]">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
