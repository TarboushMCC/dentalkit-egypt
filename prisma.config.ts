import "dotenv/config";
import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

export default defineConfig({
  // @ts-ignore — earlyAccess is valid in Prisma 7
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  datasource: {
    url: connectionString,
  },
  migrate: {
    async adapter() {
      const pool = new Pool({ connectionString });
      return new PrismaPg(pool);
    },
  },
});
