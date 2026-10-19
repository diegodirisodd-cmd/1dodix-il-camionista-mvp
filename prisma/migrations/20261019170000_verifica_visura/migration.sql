-- Verifica P.IVA con visura camerale per chi non risulta su VIES.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vatVerifiedMethod" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vatDocumentPath" TEXT;

-- Le P.IVA gia' verificate finora sono passate tutte da VIES.
UPDATE "User" SET "vatVerifiedMethod" = 'VIES' WHERE "vatVerified" = true AND "vatVerifiedMethod" IS NULL;
