// db/userService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAllUsers() {
  try {
    const allUsers = await prisma.user.findMany();
    return allUsers;
  } catch (error) {
    console.error('Error retrieving users:', error);
    throw error; // Re-throw the error to handle it in the calling module
  } finally {
    await prisma.$disconnect();
  }
}

export { getAllUsers };
