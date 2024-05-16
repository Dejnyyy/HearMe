import createExtendedPrismaClient from './prismaMiddleware';

declare global {
  var prisma: ReturnType<typeof createExtendedPrismaClient> | undefined;
}

const prismaClient = createExtendedPrismaClient();

const prisma = globalThis.prisma || prismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
export const db = prisma;
