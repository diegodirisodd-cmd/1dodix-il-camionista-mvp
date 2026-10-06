-- Nuovo modello DodiX: candidature gratuite, scelta dell'azienda, pagamento
-- dopo la scelta, chat interna, luoghi strutturati, profilo trasportatore,
-- recensioni. Solo aggiunte, idempotente (IF NOT EXISTS) per poterla
-- applicare a mano dal SQL editor e poi registrarla in _prisma_migrations.

-- Profilo trasportatore e verifica P.IVA
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vehicleTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "serviceRegions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vatVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vatVerifiedAt" TIMESTAMP(3);

-- Luoghi strutturati e ciclo di vita del carico
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "pickupCity" TEXT;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "pickupProvince" TEXT;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "pickupRegion" TEXT;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "pickupLat" DOUBLE PRECISION;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "pickupLng" DOUBLE PRECISION;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "deliveryCity" TEXT;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "deliveryProvince" TEXT;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "deliveryRegion" TEXT;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "deliveryLat" DOUBLE PRECISION;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "deliveryLng" DOUBLE PRECISION;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "pickupAddress" TEXT;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "selectedApplicationId" INTEGER;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "agreedPrice" INTEGER;
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3);
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Request_status_pickupRegion_idx" ON "Request"("status", "pickupRegion");

-- Candidature
CREATE TABLE IF NOT EXISTS "Application" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "transporterId" INTEGER NOT NULL,
    "priceCents" INTEGER,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Application_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Application_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Application_requestId_transporterId_key" ON "Application"("requestId", "transporterId");
CREATE INDEX IF NOT EXISTS "Application_transporterId_idx" ON "Application"("transporterId");

-- Chat
CREATE TABLE IF NOT EXISTS "Message" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Message_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Message_applicationId_createdAt_idx" ON "Message"("applicationId", "createdAt");

-- Recensioni
CREATE TABLE IF NOT EXISTS "Review" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
    CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Review_requestId_authorId_key" ON "Review"("requestId", "authorId");
CREATE INDEX IF NOT EXISTS "Review_targetId_idx" ON "Review"("targetId");

-- Nessun accesso dalla Data API pubblica di Supabase (stesso standard delle
-- altre tabelle): il server usa il ruolo proprietario via Prisma.
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" FORCE ROW LEVEL SECURITY;
REVOKE ALL ON "Application", "Message", "Review" FROM anon, authenticated;

-- Stati del vecchio modello (doppio pagamento alla cieca) -> nuovo modello.
-- COMPLETED con entrambi i pagamenti = contatti scambiati = CONFIRMED, con la
-- candidatura scelta ricostruita perche' entrambe le parti vedano il carico.
INSERT INTO "Application" ("requestId", "transporterId", "status", "selectedAt", "createdAt", "updatedAt")
SELECT r."id", r."transporterId", 'SELECTED', COALESCE(r."acceptedAt", r."updatedAt"), r."createdAt", now()
  FROM "Request" r
 WHERE r."status" = 'COMPLETED' AND r."transporterId" IS NOT NULL
   AND EXISTS (SELECT 1 FROM "RequestUnlock" u WHERE u."requestId" = r."id" AND u."userRole" = 'COMPANY')
   AND EXISTS (SELECT 1 FROM "RequestUnlock" u WHERE u."requestId" = r."id" AND u."userRole" = 'TRANSPORTER')
ON CONFLICT ("requestId", "transporterId") DO NOTHING;

UPDATE "Request" r
   SET "status" = 'CONFIRMED',
       "confirmedAt" = COALESCE(r."updatedAt", now()),
       "agreedPrice" = r."price",
       "selectedApplicationId" = a."id"
  FROM "Application" a
 WHERE r."status" = 'COMPLETED' AND a."requestId" = r."id" AND a."transporterId" = r."transporterId";

-- COMPANY_PAID: nessun trasportatore, l'azienda ha gia' pagato -> torna OPEN
-- e potra' scegliere un candidato senza pagare di nuovo.
UPDATE "Request" SET "status" = 'OPEN' WHERE "status" = 'COMPANY_PAID' AND "transporterId" IS NULL;

-- Tutto il resto del vecchio flusso (COMPLETED senza entrambi i pagamenti,
-- TRANSPORTER_PAID) non e' piu' raggiungibile.
UPDATE "Request" SET "status" = 'CANCELLED', "cancelledAt" = now()
 WHERE "status" IN ('COMPLETED', 'COMPANY_PAID', 'TRANSPORTER_PAID');
