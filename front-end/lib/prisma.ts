import { PrismaClient } from "@prisma/client";

/**
 * Prisma client for the front-end (Next.js Server Side).
 * Enforces server-side only usage to protect DB credentials.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  typeof window !== "undefined"
    ? (new Proxy({}, {
        get: () => {
          throw new Error("Direct Prisma access is NOT allowed in the browser!");
        },
      }) as any)
    : (globalForPrisma.prisma || new PrismaClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
