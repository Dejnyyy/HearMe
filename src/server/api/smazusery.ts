// src/server/api/smazusery.ts
import { db } from 'lib/prisma';
import { User } from '@prisma/client';

interface SmazUseryProps {
  userList: User[];
}

export class SmazUsery {
  private userList: User[];

  constructor({ userList }: SmazUseryProps) {
    this.userList = userList;
  }

  public async deleteUser(userId: string): Promise<string> {
    try {
      // Delete user from the database
      await db.user.delete({
        where: {
          id: userId,
        },
      });

      // Return the ID of the deleted user
      return userId;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error; // Rethrow the error for handling elsewhere
    }
  }
}
