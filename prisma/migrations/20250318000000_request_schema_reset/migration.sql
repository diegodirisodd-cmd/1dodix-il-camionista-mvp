-- Reset Request schema to align with simplified fields and relation
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "dropoff" TEXT NOT NULL,
    "cargo" TEXT,
    "budget" TEXT,
    "description" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "new_Request_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Request" ("id", "title", "pickup", "dropoff", "cargo", "budget", "description", "contactName", "contactPhone", "contactEmail", "companyId", "createdAt")
SELECT "id", "title", "pickup", "dropoff", "cargo", "budget", "description", "contactName", "contactPhone", "contactEmail", "companyId", "createdAt" FROM "Request";

DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";

CREATE INDEX "Request_companyId_idx" ON "Request"("companyId");

PRAGMA foreign_keys=ON;
