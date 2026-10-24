import "server-only";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[DentalKit] DATABASE_URL not set — database operations will fail.");
    return new Proxy({} as PrismaClient, {
      get: (_target, prop) => {
        if (prop === "$disconnect" || prop === "$connect") return () => Promise.resolve();
        return () => Promise.reject(new Error("DATABASE_URL is not configured. Please set it in .env"));
      },
    });
  }
  const pool = new Pool({ connectionString, max: 10 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db: PrismaClient = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
