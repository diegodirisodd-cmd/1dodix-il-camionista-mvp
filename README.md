# DodiX – Il Camionista (MVP)

MVP web per autotrasportatori e aziende costruito con **Next.js**, **React**, **Tailwind CSS** e **Prisma** su **SQLite**. Include homepage pubblica, registrazione/login con scelta ruolo (transporter/company), sessione JWT server-side e un'area protetta.
L'accesso completo richiede un abbonamento Stripe attivo: gli utenti autenticati ma non abbonati vengono indirizzati alla paywall e non possono accedere a dashboard o API fino all'attivazione.

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
│   │   │   ├── billing/checkout/route.ts # Crea sessione Stripe Checkout (subscription)
│   │   │   ├── billing/webhook/route.ts  # Webhook Stripe per aggiornare lo stato abbonamento
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
Prisma definisce un enum `UserRole` con due valori: `TRANSPORTER` e `COMPANY`.

- `User`: email univoca, password (hash), ruolo, flag `subscriptionActive` (single source of truth per l'accesso), riferimenti Stripe (`stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus`) e timestamp di creazione.
- `Request`: richiesta di trasporto pubblicata da un utente `COMPANY` con titolo, origine/destinazione, dati facoltativi su carico/budget/descrizione e riferimenti di contatto (visibili solo ai trasportatori abbonati).

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
   Popola `AUTH_SECRET` con una stringa random e robusta (es. `openssl rand -base64 32`) e aggiungi le chiavi Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`).
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
- **Registrazione**: la pagina `/register` invia email, password e ruolo a `POST /api/auth/register`, che valida i campi, genera l'hash (bcrypt), crea l'utente in SQLite e imposta un cookie di sessione JWT (`dodix_session`).
- **Login**: la pagina `/login` invia le credenziali a `POST /api/auth/login`, verifica l'hash e aggiorna il cookie di sessione JWT.
- **Logout**: `POST /api/auth/logout` invalida il cookie di sessione.
- **Protezione pagine/API**: `middleware.ts` richiede un token valido e una sottoscrizione attiva per tutte le rotte `/dashboard` e `/api` (eccezioni: `/api/auth/*` e `/api/billing/webhook`). Utenti autenticati ma senza abbonamento vengono reindirizzati a `/paywall` o ricevono risposta `402` sulle API (checkout escluso). `getSessionUser` recupera l'utente nei server component per applicare redirect server-side coerenti.
- **Checkout**: la pagina `/paywall` avvia `POST /api/billing/checkout`, che crea una sessione Stripe Checkout (subscription) con `STRIPE_PRICE_ID`; al termine Stripe riporta l'utente su `/dashboard` o, in caso di annullo, su `/paywall`.
- **Webhook**: `/api/billing/webhook` valida la firma Stripe e, sull'evento `checkout.session.completed`, attiva il flag `subscriptionActive` dell'utente trovando l'email del cliente. `subscriptionActive` è la singola fonte di verità per permettere l'accesso.
- L'accesso a `/paywall` è bloccato per chi è già abbonato: gli utenti con `subscriptionActive=true` vengono reindirizzati alla dashboard.

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

## Note
- Il database SQLite è locale al progetto (file `dev.db`) e non è incluso nel controllo versione.
- Il cookie JWT viene firmato con `AUTH_SECRET`; assicurati di mantenere la chiave segreta e rigenerarla per ambienti diversi.
- L'API `GET /api/health` restituisce uno stato base per verificare che il backend risponda.
