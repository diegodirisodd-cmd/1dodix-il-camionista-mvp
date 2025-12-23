-- Add subscriptionActive column to User
PRAGMA foreign_keys=OFF;
CREATE TABLE "_prisma_migrations_backup" AS SELECT * FROM "User";
ALTER TABLE "User" RENAME TO "User_old";
CREATE TABLE "User" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'COMPANY',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "subscriptionActive" BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
INSERT INTO "User" ("id", "email", "password", "role", "createdAt", "subscriptionActive")
  SELECT "id", "email", "password", "role", "createdAt", COALESCE("subscriptionActive", false)
  FROM "User_old";
DROP TABLE "User_old";
DROP TABLE "_prisma_migrations_backup";
PRAGMA foreign_keys=ON;
