// ERROR: Prisma should not be used directly in the front-end.
// Please use the back-end API or a server-side data fetching pattern that calls the back-end.

export const prisma = new Proxy({}, {
  get: () => {
    throw new Error("Direct Prisma access is disabled in the front-end. Please use the back-end API.");
  }
}) as any;
