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
│   │   │   └── health/route.ts          # API di esempio per stato
│   │   ├── dashboard/page.tsx           # Pagina protetta (richiede sessione)
│   │   ├── globals.css                  # Stili globali minimi
│   │   ├── layout.tsx                   # Layout root con header e main
│   │   ├── login/page.tsx               # Pagina di accesso
│   │   ├── register/page.tsx            # Pagina di registrazione
│   │   └── page.tsx                     # Homepage
│   ├── components/logout-button.tsx     # Bottone client per logout via API
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
Prisma definisce un enum `UserRole` con due valori: `TRANSPORTER` e `COMPANY`. Il modello `User` include email univoca, password (hash), ruolo e timestamp di creazione.

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
   npx prisma migrate dev --name init
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
- **Protezione pagine**: `middleware.ts` blocca l'accesso a `/dashboard` se il token non è presente o non è valido. `getSessionUser` usa Prisma per recuperare l'utente nel server component.
- I messaggi di stato sono mostrati nelle pagine tramite fetch client-side con redirect alla dashboard dopo successo.

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
