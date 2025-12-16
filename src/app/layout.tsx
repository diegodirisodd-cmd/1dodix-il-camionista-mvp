import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DodiX – Il Camionista",
  description:
    "MVP logistica per autotrasportatori: monitoraggio viaggi, comunicazioni veloci e focus sull'efficienza.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  );
}
