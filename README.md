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
│   │   │   ├── stripe/checkout/route.ts  # Avvia Stripe Checkout (abbonamento)
│   │   │   ├── stripe/webhook/route.ts   # Webhook Stripe per attivare l'abbonamento
│   │   │   └── health/route.ts          # API di esempio per stato
│   │   ├── dashboard/page.tsx           # Pagina protetta (richiede sessione)
│   │   ├── dashboard/transporter/page.tsx # Dashboard dedicata al ruolo TRANSPORTER
│   │   ├── dashboard/transporter/jobs/page.tsx # Lista richieste visibile ai trasportatori
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
├── .env.example                         # Variabili d'ambiente per SQLite, JWT e Stripe
├── next.config.mjs                      # Configurazione Next.js
├── tailwind.config.ts                   # Configurazione Tailwind CSS
└── tsconfig.json                        # Config TypeScript
```

## Modello dati
I ruoli sono stringhe (`TRANSPORTER`, `COMPANY`, `ADMIN` - quest'ultimo pensato per accessi di sola consultazione nell'MVP) compatibili con SQLite.

- `User`: email univoca, password (hash), ruolo testuale e timestamp di creazione.
- `Request`: richiesta di trasporto pubblicata da un utente `COMPANY` con origine/destinazione, carico opzionale, descrizione e prezzo.

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
   Popola `AUTH_SECRET` con una stringa random e robusta (es. `openssl rand -base64 32`).
   Configura anche le chiavi Stripe reali per il checkout:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID` (price in modalità subscription)
   - `STRIPE_WEBHOOK_SECRET` (dallo Stripe CLI o dalla dashboard)
   - `NEXT_PUBLIC_APP_URL` (es. `http://localhost:3000` in locale)
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
- **Checkout**: la pagina `/paywall` e i CTA premium chiamano `POST /api/stripe/unlock`, che crea una sessione Stripe Checkout in modalità subscription e reindirizza all'URL restituito. Al ritorno, `success_url` punta a `/dashboard?checkout=success`.
- **Webhook Stripe**: `POST /api/stripe/webhook` valida la firma (`STRIPE_WEBHOOK_SECRET`) e, su `checkout.session.completed`, imposta `subscriptionActive=true` e aggiorna i riferimenti Stripe sull'utente (email usata come chiave).
- **Admin (solo lettura)**: il ruolo `ADMIN` accede a `/dashboard/admin` per visualizzare elenco utenti e richieste in modalità di sola consultazione; non sono previste azioni di modifica o moderazione nell'MVP.

## Design system
- Palette industriale B2B: blu profondo (`brand-800`) come primario, arancio (`accent-500`) come accento e neutri controllati (`neutral-*`).
- Tipografia: Inter via `next/font` (fallback Roboto/system) con gerarchia forte su H1-H3 e label in `text-sm` semibold.
- Spaziatura codificata in variabili CSS (`--space-*`) e classi component per bottoni, card, form, tabelle, alert e badge (vedi `src/app/globals.css`).
- Documentazione completa in `docs/design-system.md` per palette, scala tipografica, componenti riutilizzabili e regole di layout.

## Pubblicazione richieste
- **Company**: compila il form nella pagina `/dashboard/company` oppure invia una `POST /api/requests` con `pickup`, `delivery`, `price` (campi facoltativi: `cargo`, `description`).
- **Transporter**: consulta `/dashboard/transporter/jobs` o chiama `GET /api/requests` per le richieste disponibili (non ancora assegnate).

## Comandi utili
- `npm run dev` – Avvia il server Next.js in modalità sviluppo.
- `npm run build` – Build di produzione.
- `npm run start` – Avvio del build di produzione.
- `npm run lint` – Linting con ESLint.
- `npm run prisma:generate` – Rigenera Prisma Client.
- `npm run prisma:migrate` – Crea o applica migrazioni sul database SQLite configurato.
- `npm run prisma:studio` – Apre Prisma Studio per ispezionare i dati.

### Reset database locale (per errori Prisma / colonne mancanti)
Se l'ambiente locale segnala colonne mancanti, riallinea il database locale senza modificare le migrazioni versionate:

```bash
# Ferma il dev server se in esecuzione
npx prisma migrate reset
npx prisma generate
npm run dev
```

### Test manuali abbonamento Stripe
1. **Eseguire il checkout**
   - Avvia l'app: `npm run dev`
   - Accedi come utente non abbonato e clicca su "Attiva abbonamento" (es. da /paywall o dalla pagina billing): il client chiama `POST /api/stripe/unlock` e ti reindirizza a Stripe.
2. **Configurare il webhook in locale**
   - Installa Stripe CLI e autenticati.
   - Avvia il forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Esegui un checkout di test: al completamento l'evento `checkout.session.completed` aggiorna `subscriptionActive=true` per l'email usata.
3. **Verifica stato in app**
   - Dopo il pagamento, torna su `/dashboard`: il badge deve mostrare "Abbonamento attivo" e le funzionalità premium devono risultare sbloccate.

## Note
- Il database SQLite è locale al progetto (file `dev.db`) e non è incluso nel controllo versione.
- Il cookie JWT viene firmato con `AUTH_SECRET`; assicurati di mantenere la chiave segreta e rigenerarla per ambienti diversi.
- L'API `GET /api/health` restituisce uno stato base per verificare che il backend risponda.
