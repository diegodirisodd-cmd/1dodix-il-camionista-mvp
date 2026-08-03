# Borsa Servizi

Sezione di DodiX dedicata alle aziende di trasporto: funziona come una borsa
carichi, ma per **richieste di servizio al mezzo** (officine, telonai,
gommisti, soccorso stradale, carrozzerie industriali, lavaggio) invece che per
trasporti. Non è una piattaforma separata: stessi utenti, stesso database,
stessi pagamenti.

## Ruoli

| Ruolo | Cosa può fare |
| --- | --- |
| `TRANSPORTER` | Pubblica richieste ("Cerco un servizio"), confronta i preventivi ricevuti, assegna l'intervento, chiude o annulla la richiesta. |
| `SUPPLIER` | Dichiara servizi offerti e province coperte, riceve notifiche sulle richieste compatibili, invia preventivi, sblocca il contatto del trasportatore a pagamento. |
| `ADMIN` | Vede richieste e fornitori in sola lettura da `/dashboard/admin`. |

## Ciclo di vita della richiesta

```
APERTA ──(primo preventivo)──> IN_TRATTATIVA ──(assegnazione)──> ASSEGNATA ──> CONCLUSA
   └────────────────────────── ANNULLATA (in qualsiasi momento, dal proprietario) ─────┘
```

- `APERTA → IN_TRATTATIVA`: automatico all'arrivo del primo preventivo.
- `→ ASSEGNATA`: `POST /api/service-requests/[id]/assign` con `quoteId`.
- `→ CONCLUSA` / `ANNULLATA`: `PATCH /api/service-requests/[id]/status`.
  `CONCLUSA` richiede che un preventivo sia già stato assegnato.

## Matching e notifiche

Un fornitore riceve una richiesta se ha una riga `SupplierServiceArea` con la
stessa **categoria** e la stessa **provincia**. Alla pubblicazione parte una
mail (Resend, via `src/lib/email.ts`) a tutti i fornitori compatibili; l'invio
è "best effort": se `RESEND_API_KEY` non è configurata viene solo loggato e la
richiesta resta valida.

## Visibilità dei contatti

Simmetrica e sempre applicata lato server in `GET /api/service-requests/[id]`:

- Il **fornitore** vede email e telefono del trasportatore solo se ha pagato lo
  sblocco per quella richiesta, o se il suo preventivo è stato assegnato.
- Il **trasportatore** vede i recapiti di un fornitore solo per il preventivo
  che ha effettivamente assegnato.
- Un fornitore vede solo il proprio preventivo; il proprietario della richiesta
  li vede tutti.

## Modello economico (v1)

- Pubblicare una richiesta: **gratis**.
- Iscriversi come fornitore e inviare preventivi: **gratis**.
- Sbloccare il contatto del trasportatore su una richiesta: importo fisso una
  tantum, definito in `SERVICE_CONTACT_UNLOCK_PRICE_CENTS`
  (`src/lib/service-categories.ts`), IVA esclusa. Il checkout addebita
  `getServiceUnlockTotalCents()`, cioè l'importo + IVA 22%, stessa aliquota
  usata per la commissione dei trasporti.

Il pagamento passa da `POST /api/stripe/service-unlock`, che crea una Checkout
Session con `metadata.kind = "SERVICE_CONTACT_UNLOCK"`. Il webhook
(`/api/stripe/webhook`) riconosce quel metadata, crea la riga
`ServiceContactUnlock` e ritorna subito, senza toccare il ramo esistente dei
`RequestUnlock`.

## Foto delle richieste

Bucket **privato** su Supabase Storage (`service-request-photos`), creato al
primo upload. In `ServiceRequestPhoto.url` viene salvato il **path**
dell'oggetto, non un URL: le API firmano un URL temporaneo (1 ora) solo per chi
ha diritto di vedere la richiesta (`src/lib/supabase-storage.ts`). Servono
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (solo lato server); senza queste
variabili l'upload risponde 503 e il resto del modulo continua a funzionare.

Limiti: 5 MB per file, formati JPG/PNG/WEBP/HEIC, massimo 6 foto per richiesta.

## API

| Metodo | Rotta | Chi |
| --- | --- | --- |
| `GET` | `/api/service-requests` | Trasportatore (le proprie), fornitore (le APERTE compatibili), admin (tutte) |
| `POST` | `/api/service-requests` | Trasportatore |
| `GET` | `/api/service-requests/[id]` | Proprietario, fornitore con profilo, admin |
| `POST` | `/api/service-requests/[id]/quotes` | Fornitore |
| `POST` | `/api/service-requests/[id]/assign` | Proprietario |
| `PATCH` | `/api/service-requests/[id]/status` | Proprietario |
| `GET`/`POST` | `/api/suppliers/profile` | Fornitore |
| `POST` | `/api/uploads/service-photo` | Trasportatore |
| `POST` | `/api/stripe/service-unlock` | Fornitore |

## Pagine

- `/dashboard/services` — bacheca (viste diverse per trasportatore e fornitore).
- `/dashboard/services/new` — form "Cerco un servizio" (solo trasportatore).
- `/dashboard/services/[id]` — dettaglio, preventivi, assegnazione o sblocco.
- `/dashboard/supplier` — panoramica fornitore con metriche e coperture.
- `/dashboard/supplier/profile` — servizi offerti × province servite.
- `/dashboard/admin` — elenco richieste e fornitori, sola lettura.

## Database

Migration `prisma/migrations/20260803_add_borsa_servizi_tables/`, già applicata
manualmente al progetto Supabase di produzione. Per allineare la history locale
senza rieseguirla:

```bash
npx prisma migrate resolve --applied 20260803_add_borsa_servizi_tables
npx prisma generate
```

Tabelle: `SupplierProfile`, `SupplierServiceArea`, `ServiceRequest`,
`ServiceRequestPhoto`, `ServiceQuote`, `ServiceContactUnlock` — RLS attivo con
lo stesso pattern `service_role_all_*` delle tabelle esistenti.

## Fuori scope in questa versione

Chat interna, recensioni, pagamenti in piattaforma tra le parti,
geolocalizzazione avanzata, abbonamento mensile per i fornitori e categorie
oltre le sei iniziali.
