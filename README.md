# DodiX – Il Camionista (MVP)

MVP web per autotrasportatori e aziende costruito con **Next.js**, **React**, **Tailwind CSS** e **Prisma** su **SQLite**. Include homepage pubblica, pagine di registrazione e login con scelta ruolo (transporter/company) e API routes basilari per l'autenticazione email/password.

## Struttura del progetto

```
.
├── prisma/                 # Schema del database
├── public/                 # Asset statici (vuoto per ora)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/route.ts     # Endpoint login email/password
│   │   │   ├── auth/register/route.ts  # Endpoint registrazione con ruolo
│   │   │   └── health/route.ts         # API di esempio per stato
│   │   ├── globals.css                 # Stili globali minimi
│   │   ├── layout.tsx                  # Layout root con header e main
│   │   ├── login/page.tsx              # Pagina di accesso
│   │   ├── register/page.tsx           # Pagina di registrazione
│   │   └── page.tsx                    # Homepage
│   └── lib/prisma.ts                   # Client Prisma condiviso
├── .env.example                        # Variabile d'ambiente per SQLite
├── next.config.mjs                     # Configurazione Next.js
├── tailwind.config.ts                  # Configurazione Tailwind CSS
└── tsconfig.json                       # Config TypeScript
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
- **Registrazione**: la pagina `/register` invia email, password e ruolo a `POST /api/auth/register`, che valida i campi, genera l'hash (bcrypt) e crea l'utente in SQLite.
- **Login**: la pagina `/login` invia le credenziali a `POST /api/auth/login`, verifica l'hash e imposta un cookie di sessione basilare (`dodix_session`).
- I messaggi di stato sono mostrati nelle pagine tramite fetch client-side.

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
- I cookie di sessione creati da `/api/auth/login` sono dimostrativi: per un ambiente produttivo serviranno gestione sessioni e scadenze reali.
- L'API `GET /api/health` restituisce uno stato base per verificare che il backend risponda.
