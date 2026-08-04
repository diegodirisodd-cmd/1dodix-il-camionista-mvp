import type { Metadata } from "next";
import { Inter, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DodiX – Il Camionista",
  description: "SaaS logistico B2B per aziende e trasportatori con controlli di accesso, richieste strutturate e contatti verificati.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${inter.variable} ${archivo.variable} ${jbMono.variable}`}>
      <body className="font-sans bg-appBg text-textStrong">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
