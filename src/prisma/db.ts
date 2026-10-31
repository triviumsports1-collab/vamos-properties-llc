import "server-only";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "@/lib/db/database-url";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

export function getDb(): PrismaClient {
  if (!globalForPrisma._prisma) {
    globalForPrisma._prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      datasources: { db: { url: runtimeDatabaseUrl() } },
    });
  }
  return globalForPrisma._prisma;
}
