import { PrismaClient } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { execSync } from "node:child_process";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL non configurato, uso SQLite locale predefinito file:./dev.db");
  process.env.DATABASE_URL = "file:./dev.db";
}

function ensurePrismaClient() {
  try {
    return new PrismaClient({
      log: ["error", "warn"],
    });
  } catch (error) {
    if (error instanceof PrismaClientInitializationError) {
      console.warn("Prisma client non inizializzato, eseguo prisma generate...");
      try {
        execSync("npx prisma generate", { stdio: "inherit" });
      } catch (generateError) {
        console.error("Impossibile eseguire prisma generate automaticamente", generateError);
        throw error;
      }

      return new PrismaClient({
        log: ["error", "warn"],
      });
    }

    throw error;
  }
}

export const prisma = globalForPrisma.prisma ?? ensurePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
