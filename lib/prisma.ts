import createExtendedPrismaClient from './prismaMiddleware';

declare global {
  var prisma: ReturnType<typeof createExtendedPrismaClient> | undefined;
}

// Initialize the Prisma client with the middleware extension
const prismaClient = createExtendedPrismaClient();

// Reuse the Prisma client instance across the application
const prisma = globalThis.prisma || prismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
export const db = prisma;
