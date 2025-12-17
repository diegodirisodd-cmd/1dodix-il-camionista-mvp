export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="card space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Logistica B2B</p>
        <div className="space-y-2">
          <h1>DodiX – Il Camionista</h1>
          <p>
            MVP industriale per autotrasportatori e aziende export/food. Stack Next.js + API Routes con database SQLite/Prisma,
            autenticazione email/password, ruoli dedicati e paywall Stripe obbligatorio.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-neutral-700">
          <span className="badge-verified">Premium</span>
          <span className="badge">TRANSPORTER</span>
          <span className="badge">COMPANY</span>
          <span className="badge">Stripe Billing</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-3">
          <h2>Funzionalità incluse</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-800">
            <li>Homepage pubblica con narrazione B2B.</li>
            <li>Registrazione con email, password e ruolo (Transporter/Company).</li>
            <li>Login con creazione cookie JWT e redirect in dashboard.</li>
            <li>Dashboard protette con controllo ruolo e stato di abbonamento.</li>
            <li>Request management: creazione, listing e contatti con gating abbonamento.</li>
          </ul>
        </div>

        <div className="card space-y-3">
          <h2>Prossimi passi suggeriti</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-800">
            <li>Validazioni avanzate, recupero password e gestione profilo.</li>
            <li>Workflow di assegnazione viaggi, tracking e notifiche.</li>
            <li>Ruoli granulari e audit trail per team aziendali.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
