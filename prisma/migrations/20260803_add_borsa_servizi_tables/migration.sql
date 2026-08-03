-- Borsa Servizi: nuove tabelle per il marketplace di servizi B2B dentro DodiX
-- NOTA: questa migration è già stata applicata manualmente al database di
-- produzione (Supabase project jluadyrdvitmunfzfpjt) il 03/08/2026.
-- Dopo aver tirato questo branch, allinea la history locale con:
--   npx prisma migrate resolve --applied 20260803_add_borsa_servizi_tables
-- così Prisma non prova a ri-eseguirla.

CREATE TABLE "SupplierProfile" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE REFERENCES "User"(id),
  "ragioneSociale" TEXT NOT NULL,
  "partitaIva" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE "SupplierProfile" IS 'Profilo azienda fornitore (officina, telonaio, gommista, ecc.) per il modulo Borsa Servizi.';

CREATE TABLE "SupplierServiceArea" (
  id SERIAL PRIMARY KEY,
  "supplierId" INTEGER NOT NULL REFERENCES "SupplierProfile"(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('TELONI_RIMORCHI','OFFICINA_MECCANICA','GOMMISTA_PESANTI','SOCCORSO_STRADALE','CARROZZERIA_INDUSTRIALE','LAVAGGIO_MEZZI')),
  provincia TEXT NOT NULL,
  UNIQUE ("supplierId", categoria, provincia)
);
CREATE INDEX "SupplierServiceArea_categoria_provincia_idx" ON "SupplierServiceArea" (categoria, provincia);

CREATE TABLE "ServiceRequest" (
  id SERIAL PRIMARY KEY,
  "transporterId" INTEGER NOT NULL REFERENCES "User"(id),
  categoria TEXT NOT NULL CHECK (categoria IN ('TELONI_RIMORCHI','OFFICINA_MECCANICA','GOMMISTA_PESANTI','SOCCORSO_STRADALE','CARROZZERIA_INDUSTRIALE','LAVAGGIO_MEZZI')),
  posizione TEXT NOT NULL,
  provincia TEXT NOT NULL,
  "marcaVeicolo" TEXT NOT NULL,
  "tipoVeicolo" TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  urgenza TEXT NOT NULL CHECK (urgenza IN ('BASSA','MEDIA','ALTA','EMERGENZA')),
  scadenza TIMESTAMP NOT NULL,
  stato TEXT NOT NULL DEFAULT 'APERTA' CHECK (stato IN ('APERTA','IN_TRATTATIVA','ASSEGNATA','CONCLUSA','ANNULLATA')),
  "assignedQuoteId" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "ServiceRequest_categoria_provincia_idx" ON "ServiceRequest" (categoria, provincia);
CREATE INDEX "ServiceRequest_stato_idx" ON "ServiceRequest" (stato);

CREATE TABLE "ServiceRequestPhoto" (
  id SERIAL PRIMARY KEY,
  "requestId" INTEGER NOT NULL REFERENCES "ServiceRequest"(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "ServiceQuote" (
  id SERIAL PRIMARY KEY,
  "requestId" INTEGER NOT NULL REFERENCES "ServiceRequest"(id) ON DELETE CASCADE,
  "supplierId" INTEGER NOT NULL REFERENCES "SupplierProfile"(id),
  "priceCents" INTEGER NOT NULL,
  tempi TEXT NOT NULL,
  disponibilita TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE ("requestId", "supplierId")
);

ALTER TABLE "ServiceRequest"
  ADD CONSTRAINT "ServiceRequest_assignedQuoteId_fkey"
  FOREIGN KEY ("assignedQuoteId") REFERENCES "ServiceQuote"(id);

CREATE TABLE "ServiceContactUnlock" (
  id SERIAL PRIMARY KEY,
  "requestId" INTEGER NOT NULL REFERENCES "ServiceRequest"(id) ON DELETE CASCADE,
  "supplierId" INTEGER NOT NULL REFERENCES "SupplierProfile"(id),
  "amountCents" INTEGER,
  "stripeSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "paidAt" TIMESTAMP NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE ("requestId", "supplierId")
);
COMMENT ON TABLE "ServiceContactUnlock" IS 'Tracking di quali fornitori hanno pagato per sbloccare il contatto su una ServiceRequest specifica. Stesso pattern di RequestUnlock.';

ALTER TABLE "SupplierProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupplierProfile" FORCE ROW LEVEL SECURITY;
CREATE POLICY service_role_all_supplier_profile ON "SupplierProfile" FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "SupplierServiceArea" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupplierServiceArea" FORCE ROW LEVEL SECURITY;
CREATE POLICY service_role_all_supplier_area ON "SupplierServiceArea" FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ServiceRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceRequest" FORCE ROW LEVEL SECURITY;
CREATE POLICY service_role_all_service_request ON "ServiceRequest" FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ServiceRequestPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceRequestPhoto" FORCE ROW LEVEL SECURITY;
CREATE POLICY service_role_all_service_request_photo ON "ServiceRequestPhoto" FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ServiceQuote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceQuote" FORCE ROW LEVEL SECURITY;
CREATE POLICY service_role_all_service_quote ON "ServiceQuote" FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ServiceContactUnlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceContactUnlock" FORCE ROW LEVEL SECURITY;
CREATE POLICY service_role_all_service_contact_unlock ON "ServiceContactUnlock" FOR ALL TO service_role USING (true) WITH CHECK (true);
