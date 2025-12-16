export default function HomePage() {
  return (
    <section>
      <h1>DodiX – Il Camionista</h1>
      <p>
        MVP web per autotrasportatori e aziende, basato su Next.js, API Routes e database PostgreSQL con Prisma.
        Include homepage pubblica più accesso e registrazione con scelta ruolo.
      </p>

      <h2>Funzionalità incluse</h2>
      <ul>
        <li>Home page con panoramica dell'app.</li>
        <li>Pagina di registrazione con invio dati (email, password, ruolo) a un endpoint API.</li>
        <li>Pagina di accesso con verifica delle credenziali.</li>
        <li>Layout condiviso con navigazione essenziale.</li>
      </ul>

      <h2>Prossimi passi suggeriti</h2>
      <ul>
        <li>Gestione delle sessioni e persistenza dei token.</li>
        <li>Validazioni più avanzate e recupero password.</li>
        <li>Implementazione delle funzionalità operative per viaggi e tappe.</li>
      </ul>
    </section>
  );
}
