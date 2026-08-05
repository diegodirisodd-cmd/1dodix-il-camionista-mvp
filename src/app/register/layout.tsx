import type { Metadata } from "next";

// Come /login: pagina client, quindi i metadata stanno nel layout di segmento.
export const metadata: Metadata = {
  title: "Registrati",
  description:
    "Crea il tuo account DodiX come azienda, trasportatore o fornitore di servizi. Registrazione gratuita.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
