import React, { useState } from 'react';
import { db } from 'lib/prisma';
import { User } from '@prisma/client';

interface UsersPageProps {
  userList: User[];
}

const UsersPage: React.FC<UsersPageProps> = ({ userList: initialUserList }) => {
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
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
      <h1>User List</h1>
      <ul className='text-white font-mono mb-5 text-lg'>
        {userList.map(user => (
          <li key={user.id}>
            {user.name}
            <button
              className='float-right ml-8 border h-7 px-2 bg-white text-black rounded-md font-mono font-semibold hover:bg-gray-300 hover:border-gray-300'
              onClick={() => handleDeleteUser(user.id)}
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
