# Collegamento WhatsApp Cloud API

## Cosa implementa questa modifica

`/api/whatsapp/webhook` accetta la verifica GET di Meta e le notifiche POST
firmate con l'App Secret. Prima di rispondere 200 salva gli eventi nel database
PostgreSQL esistente, nella nuova tabella `WhatsAppWebhookReceipt`.

Il callback previsto per la produzione è:

`https://www.dodix.it/api/whatsapp/webhook`

Confermare in Vercel che `www.dodix.it` sia assegnato a questo progetto e al
deployment che contiene la modifica. Non usare un URL di preview protetto da login.

Questa è una **casella di ricezione tecnica**: conserva messaggi, stati di consegna
e aggiornamenti del WABA. Non invia messaggi, non risponde automaticamente, non
mostra una chat nell'app e non attiva notifiche sui nuovi carichi. Tali funzioni
richiedono un'elaborazione successiva e, per gli invii, credenziali e template.

## 1. Preparare il database prima dell'attivazione in Meta

La migrazione è esclusivamente aggiuntiva:

`prisma/migrations/20260907140000_add_whatsapp_webhook_receipts/migration.sql`

- Verificare quale database usa il `DATABASE_URL` di **Production** in Vercel,
  senza divulgare la connection string. Non confonderlo con il solo storage foto.
- Se la cronologia Prisma del database è già allineata, applicare la migrazione
  con la normale procedura di distribuzione (`prisma migrate deploy`).
- Se le migrazioni precedenti sono state applicate manualmente, come documentato
  nel repository, **non eseguire alla cieca tutte le migrazioni storiche**. Usare
  l'editor SQL del database corretto per eseguire soltanto il file sopra, in una
  transazione. Il file può essere rieseguito senza cancellare la tabella.
- Nel caso manuale, registrare successivamente la migrazione nella cronologia
  Prisma tramite `prisma migrate resolve --applied 20260907140000_add_whatsapp_webhook_receipts`
  in un ambiente autorizzato. Non modificare manualmente `_prisma_migrations`.
- La tabella abilita RLS senza policy pubbliche: non renderla accessibile ad
  `anon` o `authenticated`. Il ruolo server usato da Prisma deve essere il
  proprietario della tabella o avere BYPASSRLS; verificare lettura e inserimento.

Le ricevute contengono dati dei messaggi. Restano nel database server e non sono
esposte da nessuna nuova API di lettura. Definire conservazione e cancellazione
prima di usare questa casella per traffico reale continuativo: questa modifica
non introduce un processo automatico di scadenza o di elaborazione delle ricevute.

## 2. Variabili Vercel, solo lato server

Nel progetto `dodi-x / 1dodix-il-camionista-mvp`, ambiente **Production**:

| Nome | Valore |
| --- | --- |
| `WHATSAPP_VERIFY_TOKEN` | Nuovo segreto casuale, almeno 32 caratteri; conservare lo stesso valore per Meta |
| `META_APP_SECRET` | App Secret dell'app DodiX, da leggere privatamente in Meta |
| `WHATSAPP_WABA_ID` | ID reale del WABA principale, da WhatsApp Manager |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone Number ID reale del numero registrato, da WhatsApp Manager |

Non usare il token Graph API, il PIN del numero o il codice ricevuto al telefono
come `META_APP_SECRET`. Non anteporre `NEXT_PUBLIC_` ai segreti. Non commettere
valori reali nel repository o copiarli in chat, screenshot o log. La verifica GET
richiede tutte e quattro le variabili, così un callback incompleto non viene attivato.

Le modifiche alle variabili valgono per un **nuovo deployment**: configurarle prima
del merge/distribuzione, oppure ridistribuire dopo averle aggiunte. Il build standard
rimane invariato e **non applica automaticamente migrazioni al database**.

## 3. Pubblicare e verificare

Unire la modifica solo dopo i controlli e verificare che Vercel produca un deployment
Production `Ready`, associato al dominio corretto e al commit del merge.

La visita GET del callback senza parametri deve dare HTTP 400 con
`Invalid verification request`: conferma solo che la route e la configurazione
sono disponibili, non dimostra che il database possa salvare gli eventi.

- 404: codice non pubblicato o dominio/progetto errato.
- 503 `Webhook not configured`: variabili mancanti, token troppo corto o ID non validi.
- 401/403 da una pagina HTML o redirect al login: verificare la protezione del
  deployment; Meta deve poter raggiungere il callback pubblico.

## 4. Configurazione Meta

In DodiX → configurazione WhatsApp di produzione → Configura webhook:

- URL di callback: `https://www.dodix.it/api/whatsapp/webhook`.
- Token di verifica: esattamente il valore `WHATSAPP_VERIFY_TOKEN` salvato in Vercel.
- Premere **Verifica e salva**. Il server restituisce `hub.challenge` in testo semplice.
- Controllare l'iscrizione dell'app al WABA indicato e al campo `messages`, che
  contiene sia messaggi ricevuti sia aggiornamenti di consegna. Sottoscrivere
  `message_template_status_update` solo se si vogliono conservare anche quegli eventi.
- Il token di verifica serve alla verifica iniziale. Le POST vengono autenticate
  separatamente con HMAC-SHA256 sul corpo originale e `META_APP_SECRET`.

I test generici della dashboard possono usare WABA/Phone Number ID fittizi:
vengono riconosciuti come eventi di altri asset e ignorati (`received: true,
ignored: true`). Un test verde della dashboard da solo **non prova** la persistenza.

## 5. Prova reale, controllata dal proprietario

Inviare manualmente un messaggio di prova da un **altro numero WhatsApp** al numero
business registrato. Non registrare questo numero nuovamente nell'app mobile.
Non attivare campagne o notifiche ai clienti per provare il webhook.

Controllare in Vercel una POST 200 e il messaggio di log
`[whatsapp-webhook] receipt_stored <hash>`. Nel database verificare una nuova riga,
leggendo soltanto `id`, `receivedAt`, `wabaId`, `phoneNumberId`, senza mostrare
`payload` in chat. Non è prevista una risposta automatica al messaggio.

POST 401 indica una firma mancante o non valida: verificare App Secret e app di
origine. POST 400 indica un payload non valido. POST 503 `Temporary storage failure`
indica un problema di tabella, permessi o connessione: il server non conferma la
consegna e lascia che Meta ritenti. Non disabilitare il controllo della firma o RLS.

## Comportamento e test

- Nessun segreto, numero del mittente o testo dei messaggi viene scritto nei log.
- Eventi di altri WABA/numeri vengono ignorati, anche dentro batch misti.
- Payload oltre 3 MiB vengono rifiutati anche senza `Content-Length`.
- Le riconsegne dello stesso payload selezionato condividono una chiave hash; un
  inserimento concorrente usa `ON CONFLICT DO NOTHING` tramite Prisma.
- La deduplicazione è per ricevuta, non per singolo `wamid`: un futuro elaboratore
  dovrà deduplicare i singoli messaggi/stati quando cambiano batch o metadati.
- `npm run test:whatsapp` verifica handshake, firme, isolamento asset, JSON errato,
  limiti, redelivery e attesa/errori di persistenza usando un archivio simulato.
- Eseguire anche `npx tsc --noEmit`, `npm run lint` e `npm run build`.

Riferimenti Meta:
- https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/
- https://www.postman.com/meta/whatsapp-business-platform/folder/lboq68h/webhooks
