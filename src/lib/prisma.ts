import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getDbUrl() {
  const url = process.env.DATABASE_URL!;
  // Remove channel_binding param — incompatible with Neon HTTP transport
  return url.replace(/[&?]channel_binding=[^&]*/g, "");
}

function createPrismaClient() {
  const adapter = new PrismaNeonHttp(getDbUrl(), {});
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
