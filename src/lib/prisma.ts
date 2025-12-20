import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as GlobalWithPrisma;

function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Prisma Client non disponibile, eseguo 'prisma generate' per rigenerarlo...");
      try {
        execSync("npx prisma generate", { stdio: "inherit" });
      } catch (generateError) {
        console.error("Impossibile generare Prisma Client", generateError);
        throw error;
      }

      return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    }

    throw error;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
