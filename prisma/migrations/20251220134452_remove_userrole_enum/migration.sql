-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "dropoff" TEXT NOT NULL,
    "timeWindow" TEXT NOT NULL DEFAULT '',
    "cargoType" TEXT NOT NULL DEFAULT '',
    "estimatedWeight" TEXT NOT NULL DEFAULT '',
    "cargo" TEXT,
    "budget" TEXT,
    "description" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Request_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("budget", "cargo", "cargoType", "companyId", "contactEmail", "contactName", "contactPhone", "createdAt", "description", "dropoff", "estimatedWeight", "id", "pickup", "timeWindow", "title", "updatedAt") SELECT "budget", "cargo", "cargoType", "companyId", "contactEmail", "contactName", "contactPhone", "createdAt", "description", "dropoff", "estimatedWeight", "id", "pickup", "timeWindow", "title", "updatedAt" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
CREATE INDEX "Request_companyId_idx" ON "Request"("companyId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COMPANY',
    "phone" TEXT,
    "operatingArea" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "operatingArea", "password", "phone", "role", "stripeCustomerId", "stripeSubscriptionId", "subscriptionActive", "subscriptionStatus") SELECT "createdAt", "email", "id", "name", "operatingArea", "password", "phone", "role", "stripeCustomerId", "stripeSubscriptionId", "subscriptionActive", "subscriptionStatus" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
