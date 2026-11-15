-- I trasportatori possono pubblicare carichi (sub-vezione): registriamo quando
-- hanno dichiarato il consenso scritto del committente.
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "subcontractDeclaredAt" TIMESTAMP(3);
