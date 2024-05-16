// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import logAndMoveDeletedVote from './prismaMiddleware';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// Apply the middleware
prisma.$use(logAndMoveDeletedVote);

export default prisma;
export const db = prisma;
