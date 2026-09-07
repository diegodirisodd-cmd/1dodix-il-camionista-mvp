-- Additive only: does not change existing application tables.
-- IF NOT EXISTS permits later migrate deploy after a manual SQL-editor rollout.
CREATE TABLE IF NOT EXISTS "WhatsAppWebhookReceipt" (
    "id" TEXT NOT NULL,
    "wabaId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppWebhookReceipt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WhatsAppWebhookReceipt_receivedAt_idx"
    ON "WhatsAppWebhookReceipt"("receivedAt");

-- No public Supabase Data API access. The server DATABASE_URL must use the
-- table owner or a BYPASSRLS role (normally the existing Prisma server role).
ALTER TABLE "WhatsAppWebhookReceipt" ENABLE ROW LEVEL SECURITY;
