// src/queries/smazusery.ts
import { db } from 'lib/prisma';
import { User } from '@prisma/client';

interface SmazUseryProps {
  userList: User[];
}

export const SmazUsery = ({ userList: initialUserList }: SmazUseryProps) => {
  const deleteUser = async (userId: string) => {
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
  };

  return {
    deleteUser,
  };
};

export default SmazUsery;
