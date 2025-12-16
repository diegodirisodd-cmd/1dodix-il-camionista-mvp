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
│   │   │   └── health/route.ts          # API di esempio per stato
│   │   ├── dashboard/page.tsx           # Pagina protetta (richiede sessione)
│   │   ├── dashboard/transporter/page.tsx # Dashboard dedicata al ruolo TRANSPORTER
│   │   ├── dashboard/transporter/requests/page.tsx # Lista richieste visibile ai trasportatori
│   │   ├── dashboard/company/page.tsx    # Dashboard dedicata al ruolo COMPANY con form pubblicazione richieste
│   │   ├── globals.css                  # Stili globali minimi
│   │   ├── layout.tsx                   # Layout root con header e main
│   │   ├── login/page.tsx               # Pagina di accesso
│   │   ├── register/page.tsx            # Pagina di registrazione
│   │   └── page.tsx                     # Homepage
│   ├── components/logout-button.tsx     # Bottone client per logout via API
│   ├── components/
│   │   ├── dashboard/request-form.tsx   # Form client per pubblicare richieste lato azienda
│   │   └── dashboard/section-card.tsx   # Card riutilizzabile per le sezioni dashboard
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

- `User`: email univoca, password (hash), ruolo, flag `subscriptionActive` (sblocca contatti lato trasportatore) e timestamp di creazione.
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
   Popola `AUTH_SECRET` con una stringa random e robusta (es. `openssl rand -base64 32`).
3. **Migrazione database** (genera anche Prisma Client)
   ```bash
   npx prisma migrate dev
   ```
4. **Avvio in sviluppo**
   ```bash
   npm run dev
   ```
   L'app sarà disponibile su http://localhost:3000.

## Flusso di autenticazione
- **Registrazione**: la pagina `/register` invia email, password e ruolo a `POST /api/auth/register`, che valida i campi, genera l'hash (bcrypt), crea l'utente in SQLite e imposta un cookie di sessione JWT (`dodix_session`).
- **Login**: la pagina `/login` invia le credenziali a `POST /api/auth/login`, verifica l'hash e aggiorna il cookie di sessione JWT.
- **Logout**: `POST /api/auth/logout` invalida il cookie di sessione.
- **Protezione pagine**: `middleware.ts` blocca l'accesso a `/dashboard` se il token non è presente o non è valido. `getSessionUser` usa Prisma per recuperare l'utente nel server component. La pagina `/dashboard/transporter` e `/dashboard/transporter/requests` applicano un controllo server-side aggiuntivo sul ruolo `TRANSPORTER` e nascondono i contatti aziendali se `subscriptionActive` è falso. La pagina `/dashboard/company` richiede ruolo `COMPANY` e offre panoramica profilo + gestione/pubblicazione richieste.
- I messaggi di stato sono mostrati nelle pagine tramite fetch client-side con redirect alla dashboard dopo successo.

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
