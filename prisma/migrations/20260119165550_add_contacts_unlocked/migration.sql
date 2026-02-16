-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pickup" TEXT NOT NULL,
    "delivery" TEXT NOT NULL,
    "cargo" TEXT,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "transporterId" INTEGER,
    "contactsUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Request_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("cargo", "companyId", "createdAt", "delivery", "description", "id", "pickup", "price", "transporterId") SELECT "cargo", "companyId", "createdAt", "delivery", "description", "id", "pickup", "price", "transporterId" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
