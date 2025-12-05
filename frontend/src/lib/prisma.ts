// /lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

declare global {
  var prisma: PrismaClient | undefined;
}
const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

const adapter = new PrismaPg(pool);

export const prisma = globalThis.prisma || new PrismaClient({adapter});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
