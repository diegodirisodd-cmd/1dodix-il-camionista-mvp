import type { Metadata } from "next";

// La pagina di login è un client component e non può esportare metadata:
// il layout di segmento è il posto in cui dichiararli.
export const metadata: Metadata = {
  title: "Accedi",
  description:
    "Accedi a DodiX: la piattaforma che collega aziende, trasportatori e fornitori di servizi per il mezzo.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
