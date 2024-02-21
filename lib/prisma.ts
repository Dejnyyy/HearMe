// prisma jedinacek
import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;


// import { PrismaClient } from "@prisma/client";

declare global {
     var prisma: PrismaClient | undefined;
 }
 export const db = globalThis.prisma || new PrismaClient();

 if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;