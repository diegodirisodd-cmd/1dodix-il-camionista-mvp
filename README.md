# DodiX – Il Camionista (MVP)

MVP web per autotrasportatori costruito con **Next.js**, **React**, **Tailwind CSS** e **Prisma** su **SQLite**. Offre una homepage informativa, API route base e una struttura pronta per evolvere con funzionalità di logistica (viaggi, aggiornamenti, note).

## Struttura del progetto

```
.
├── prisma/              # Schema del database e file SQLite (non incluso)
├── public/              # Asset statici (vuoto per ora)
├── src/
│   ├── app/             # App Router di Next.js
│   │   ├── api/health/  # API route di esempio
│   │   ├── globals.css  # Stili globali con Tailwind
│   │   ├── layout.tsx   # Layout root
│   │   └── page.tsx     # Homepage
│   └── components/      # Componenti riutilizzabili (da aggiungere)
├── .env.example         # Variabile d'ambiente per SQLite
├── next.config.mjs      # Configurazione Next.js
├── tailwind.config.ts   # Configurazione Tailwind CSS
└── tsconfig.json        # Config TypeScript
```

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
   npm run prisma:migrate -- --name init
   ```
4. **Avvio in sviluppo**
   ```bash
   npm run dev
   ```
   L'app sarà disponibile su http://localhost:3000.

## Comandi utili
- `npm run dev` – Avvia il server Next.js in modalità sviluppo.
- `npm run build` – Build di produzione.
- `npm run start` – Avvio del build di produzione.
- `npm run lint` – Linting con ESLint.
- `npm run prisma:generate` – Rigenera Prisma Client.
- `npm run prisma:migrate` – Crea o applica migrazioni su SQLite.
- `npm run prisma:studio` – Apre Prisma Studio per ispezionare i dati.

## Note
- Nessuna autenticazione è ancora presente.
- Il database SQLite (`prisma/dev.db`) è ignorato nel controllo versione: sarà generato dopo la prima migrazione.
- L'API `GET /api/health` restituisce uno stato base per verificare che il backend risponda.
