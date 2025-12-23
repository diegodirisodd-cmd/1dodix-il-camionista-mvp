# DodiX – Il Camionista (MVP)

MVP web per autotrasportatori e aziende costruito con **Next.js**, **React**, **Tailwind CSS** e **Prisma** su **SQLite**. Include homepage pubblica, registrazione/login con scelta ruolo (transporter/company), sessione JWT server-side e un'area protetta.

## Struttura del progetto
```
.
├── prisma/                              # Schema del database
├── public/                              # Asset statici (vuoto per ora)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/route.ts      # Endpoint login email/password + cookie JWT
│   │   │   ├── auth/logout/route.ts     # Pulizia cookie di sessione
│   │   │   ├── auth/register/route.ts   # Endpoint registrazione con ruolo
│   │   │   ├── requests/route.ts        # API creazione/lista richieste di trasporto
│   │   │   ├── requests/[id]/route.ts   # API dettaglio/aggiornamento/cancellazione richiesta
│   │   │   ├── (api billing)             # Non usato in questa versione MVP (checkout via link esterno)
│   │   │   └── health/route.ts          # API di esempio per stato
│   │   ├── dashboard/page.tsx           # Pagina protetta (richiede sessione)
│   │   ├── dashboard/transporter/page.tsx # Dashboard dedicata al ruolo TRANSPORTER
│   │   ├── dashboard/transporter/requests/page.tsx # Lista richieste visibile ai trasportatori
│   │   ├── dashboard/company/page.tsx    # Dashboard dedicata al ruolo COMPANY con form pubblicazione richieste
│   │   ├── paywall/page.tsx             # Spiega il paywall e avvia il checkout Stripe
│   │   ├── globals.css                  # Stili globali minimi
│   │   ├── layout.tsx                   # Layout root con header e main
│   │   ├── login/page.tsx               # Pagina di accesso
│   │   ├── register/page.tsx            # Pagina di registrazione
│   │   └── page.tsx                     # Homepage
│   ├── components/logout-button.tsx     # Bottone client per logout via API
│   ├── components/
│   │   ├── dashboard/request-form.tsx   # Form client per pubblicare richieste lato azienda
│   │   ├── dashboard/section-card.tsx   # Card riutilizzabile per le sezioni dashboard
│   │   └── paywall-actions.tsx          # CTA client-side per avviare il checkout
│   └── lib/
│       ├── auth.ts                      # Firma/verifica token e lettura sessione
│       └── prisma.ts                    # Client Prisma condiviso
├── middleware.ts                        # Protezione delle rotte (dashboard)
├── .env.example                         # Variabili d'ambiente per SQLite e JWT secret
├── next.config.mjs                      # Configurazione Next.js
├── tailwind.config.ts                   # Configurazione Tailwind CSS
└── tsconfig.json                        # Config TypeScript
```

## Modello dati
I ruoli sono stringhe (`TRANSPORTER`, `COMPANY`, `ADMIN` - quest'ultimo pensato per accessi di sola consultazione nell'MVP) compatibili con SQLite.

- `User`: email univoca, password (hash), ruolo testuale e timestamp di creazione.
- `Request`: richiesta di trasporto pubblicata da un utente `COMPANY` con titolo, origine/destinazione, dati facoltativi su carico/budget/descrizione e riferimenti di contatto.

## Prerequisiti
- Node.js 18+
- npm (o altro package manager compatibile)

## Setup locale
1. **Installazione dipendenze**
   ```bash
   npm install
   ```
2. **Variabili d'ambiente**
   ```bash
   cp .env.example .env
   ```
   Popola `AUTH_SECRET` con una stringa random e robusta (es. `openssl rand -base64 32`). Il checkout usa un link Stripe esterno e non richiede chiavi aggiuntive in questa versione.
3. **Migrazione database** (genera anche Prisma Client)
   ```bash
   npx prisma migrate dev
   ```
4. **Avvio in sviluppo**
   ```bash
   npm run dev
   ```
   L'app sarà disponibile su http://localhost:3000.

## Flusso di autenticazione e billing
- **Registrazione**: la pagina `/register` invia email, password e ruolo a `POST /api/auth/register`, che valida i campi, genera l'hash (bcrypt) e crea l'utente in SQLite.
- **Login**: la pagina `/login` invia le credenziali a `POST /api/auth/login`, verifica l'hash, imposta il cookie di sessione JWT (`dodix_session`) e restituisce il reindirizzamento corretto in base al ruolo.
- **Logout**: `POST /api/auth/logout` invalida il cookie di sessione.
- **Protezione pagine/API**: `middleware.ts` richiede un token valido per tutte le rotte `/dashboard`. `getSessionUser` recupera l'utente nei server component per applicare redirect server-side coerenti.
- **Checkout MVP**: la pagina `/paywall` reindirizza direttamente al link di Stripe Checkout esterno (`https://buy.stripe.com/dRm5kv6bn2MqdGK984c7u01`).
- **Admin (solo lettura)**: il ruolo `ADMIN` accede a `/dashboard/admin` per visualizzare elenco utenti e richieste in modalità di sola consultazione; non sono previste azioni di modifica o moderazione nell'MVP.

## Design system
- Palette industriale B2B: blu profondo (`brand-800`) come primario, arancio (`accent-500`) come accento e neutri controllati (`neutral-*`).
- Tipografia: Inter via `next/font` (fallback Roboto/system) con gerarchia forte su H1-H3 e label in `text-sm` semibold.
- Spaziatura codificata in variabili CSS (`--space-*`) e classi component per bottoni, card, form, tabelle, alert e badge (vedi `src/app/globals.css`).
- Documentazione completa in `docs/design-system.md` per palette, scala tipografica, componenti riutilizzabili e regole di layout.

## Pubblicazione richieste
- **Company**: compila il form nella pagina `/dashboard/company` oppure invia una `POST /api/requests` con `title`, `pickup`, `dropoff`, `contactName`, `contactPhone`, `contactEmail` (campi facoltativi: `cargo`, `budget`, `description`).
- **Transporter**: consulta `/dashboard/transporter/requests` o chiama `GET /api/requests`. I contatti vengono restituiti solo se l'utente ha `subscriptionActive=true`, altrimenti vengono mascherati (`contactHidden`).

## Comandi utili
- `npm run dev` – Avvia il server Next.js in modalità sviluppo.
- `npm run build` – Build di produzione.
- `npm run start` – Avvio del build di produzione.
- `npm run lint` – Linting con ESLint.
- `npm run prisma:generate` – Rigenera Prisma Client.
- `npm run prisma:migrate` – Crea o applica migrazioni sul database SQLite configurato.
- `npm run prisma:studio` – Apre Prisma Studio per ispezionare i dati.

### Reset database locale (per errori Prisma / colonne mancanti)
Se l'ambiente locale segnala colonne mancanti (es. `subscriptionActive`), azzera il database di sviluppo e riallinea lo schema:

```bash
rm -f prisma/dev.db prisma/dev.db-journal
npx prisma generate
npx prisma migrate dev --name reset_local_db
```

Questo rigenera il client, ricrea `dev.db` coerente con lo schema corrente e mantiene intatte le migrazioni tracciate nel repository.

## Note
- Il database SQLite è locale al progetto (file `dev.db`) e non è incluso nel controllo versione.
- Il cookie JWT viene firmato con `AUTH_SECRET`; assicurati di mantenere la chiave segreta e rigenerarla per ambienti diversi.
- L'API `GET /api/health` restituisce uno stato base per verificare che il backend risponda.
