//src/queries/smazusery.ts
import React, { useState } from 'react';
import { db } from 'lib/prisma';
import { User } from '@prisma/client';

interface SmazUseryProps {
  userList: User[];
  onDeleteUser: (userId: string) => void;
}

const SmazUsery: React.FC<SmazUseryProps> = ({ userList: initialUserList, onDeleteUser }) => {
  const [userList, setUserList] = useState<User[]>(initialUserList);

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user from the database
      await db.user.delete({
        where: {
          id: userId,
        },
      });

      // Update the user list after deletion
      const updatedUserList = userList.filter(user => user.id !== userId);
      setUserList(updatedUserList);
      
      // Call onDeleteUser to inform the parent component about the deletion
      onDeleteUser(userId);
      handleDeleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  // Render nothing here as SmazUsery is not rendering anything
  return null;
};

export default SmazUsery;
