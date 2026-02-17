import {
  deriveStatusFromUnlockFlags,
  shouldShowContacts,
  shouldShowPaymentButton,
  type PaymentRequest,
} from "@/lib/payment-visibility";

const demoRequests: Array<{ id: string; request: PaymentRequest }> = [
  {
    id: "REQ-OPEN",
    request: {
      unlockedByTransporter: false,
      unlockedByCompany: false,
      contactsUnlocked: false,
    },
  },
  {
    id: "REQ-TRANSPORTER",
    request: {
      unlockedByTransporter: true,
      unlockedByCompany: false,
      contactsUnlocked: false,
    },
  },
  {
    id: "REQ-COMPANY",
    request: {
      unlockedByTransporter: false,
      unlockedByCompany: true,
      contactsUnlocked: false,
    },
  },
  {
    id: "REQ-COMPLETED",
    request: {
      unlockedByTransporter: true,
      unlockedByCompany: true,
      contactsUnlocked: true,
    },
  },
];

export default function HomePage() {
  return (
    <section>
      <h1>DodiX – Il Camionista</h1>
      <p>
        MVP web per autotrasportatori e aziende, basato su Next.js, API Routes e database PostgreSQL con Prisma.
        Include homepage pubblica più accesso e registrazione con scelta ruolo.
      </p>

      <h2>Logica pagamento (boolean-driven)</h2>
      <p>
        La visibilità dei pulsanti di pagamento e dei contatti è guidata solo da
        <code> unlockedByTransporter</code>, <code>unlockedByCompany</code> e
        <code> contactsUnlocked</code>.
      </p>
      <ul>
        {demoRequests.map(({ id, request }) => (
          <li key={id}>
            <strong>{id}</strong> — stato derivato: {deriveStatusFromUnlockFlags(request)} — bottone trasportatore:{" "}
            {shouldShowPaymentButton(request, "TRASPORTATORE") ? "mostra" : "nascosto"} — bottone azienda:{" "}
            {shouldShowPaymentButton(request, "AZIENDA") ? "mostra" : "nascosto"} — contatti:{" "}
            {shouldShowContacts(request) ? "visibili" : "nascosti"}
          </li>
        ))}
      </ul>

      <h2>Funzionalità incluse</h2>
      <ul>
        <li>Home page con panoramica dell&apos;app.</li>
        <li>Pagina di registrazione con invio dati (email, password, ruolo) a un endpoint API.</li>
        <li>Pagina di accesso con verifica delle credenziali.</li>
        <li>Layout condiviso con navigazione essenziale.</li>
      </ul>
    </section>
  );
}
