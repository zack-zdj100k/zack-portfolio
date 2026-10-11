import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/server/generated/prisma/client";
import { env } from "@/server/env";

function createClient() {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
}

// One client across dev hot reloads; replaced when `prisma generate` produced a new class.
const g = globalThis as unknown as { prisma?: PrismaClient; prismaClass?: unknown };
export const prisma = g.prismaClass === PrismaClient && g.prisma ? g.prisma : createClient();

if (process.env.NODE_ENV !== "production") {
  g.prisma = prisma;
  g.prismaClass = PrismaClient;
}
