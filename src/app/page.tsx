export default function HomePage() {
  return (
    <section>
      <h1>DodiX – Il Camionista</h1>
      <p>
        MVP web per autotrasportatori e aziende, basato su Next.js, API Routes e database SQLite con Prisma.
        Include homepage pubblica, autenticazione email/password e ruoli utente.
      </p>

      <h2>Funzionalità incluse</h2>
      <ul>
        <li>Home page con panoramica dell'app.</li>
        <li>Pagina di registrazione con invio dati (email, password, ruolo) a un endpoint API.</li>
        <li>Pagina di accesso con verifica delle credenziali e creazione cookie di sessione.</li>
        <li>Area protetta (dashboard) accessibile solo se autenticati.</li>
        <li>Layout condiviso con navigazione essenziale.</li>
      </ul>

      <h2>Prossimi passi suggeriti</h2>
      <ul>
        <li>Validazioni più avanzate, recupero password e gestione profilo.</li>
        <li>Implementazione delle funzionalità operative per viaggi e tappe.</li>
        <li>Ruoli e permessi granulari sulle sezioni applicative.</li>
      </ul>
    </section>
  );
}
