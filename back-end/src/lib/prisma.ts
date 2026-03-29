import { PrismaClient } from "@prisma/client";
import { meiliSyncQueue } from "../jobs/meiliSyncProcessor";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaBase =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

export const prisma = prismaBase.$extends({
  query: {
    profile: {
      async create({ args, query }) {
        const result = await query(args);
        meiliSyncQueue.add('sync-profile', { profileId: result.id, action: 'CREATE' });
        return result;
      },
      async update({ args, query }) {
        const result = await query(args);
        meiliSyncQueue.add('sync-profile', { profileId: result.id, action: 'UPDATE' });
        return result;
      },
      async delete({ args, query }) {
        const result = await query(args);
        meiliSyncQueue.add('sync-profile', { profileId: result.id, action: 'DELETE' });
        return result;
      }
    }
  }
});

// Since $extends returns a different type, we cast it back safely for global tracking or ignore
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaBase;
