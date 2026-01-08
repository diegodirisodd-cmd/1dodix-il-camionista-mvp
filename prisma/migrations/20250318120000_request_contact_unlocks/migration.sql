-- Add contact unlock flags for commission-based unlocks
ALTER TABLE "Request" ADD COLUMN "contactsUnlockedByCompany" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Request" ADD COLUMN "contactsUnlockedByTransporter" BOOLEAN NOT NULL DEFAULT false;
