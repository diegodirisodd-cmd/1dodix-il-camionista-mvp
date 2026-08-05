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
  // Il template fa sì che ogni pagina debba dichiarare solo il proprio titolo:
  // il suffisso del prodotto lo aggiunge Next.
  title: {
    default: "DodiX – Il Camionista",
    template: "%s · DodiX",
  },
  description:
    "Piattaforma B2B di logistica: aziende e trasportatori si incontrano senza intermediari, con contatti verificati e la Borsa Servizi per officine, telonai e gommisti.",
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
