-- Add shipping-specific fields for requests
PRAGMA foreign_keys=OFF;

ALTER TABLE "Request" ADD COLUMN "timeWindow" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Request" ADD COLUMN "cargoType" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Request" ADD COLUMN "estimatedWeight" TEXT NOT NULL DEFAULT '';

PRAGMA foreign_keys=ON;
