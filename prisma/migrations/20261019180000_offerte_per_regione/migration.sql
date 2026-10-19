-- Offerte mirate: sigle di provincia della sede dei destinatari (vuoto = tutti).
ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "targetProvinces" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
