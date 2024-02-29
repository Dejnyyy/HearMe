import React, { useState } from 'react';
import { db } from 'lib/prisma';
import { User } from '@prisma/client';
import Image from 'next/image';

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
          <>
          <div className='flex m-8'>
          <li key={user.id} className=''>
          <Image src={user.image || ''} alt="user" width={1200} height={1200} className="w-10 h-10 rounded-full" />  {user.name} {user.emailVerified && <span className='text-green-500'>(verified)</span>} 

            </li>
            <button
                className='ml-8 m-auto border h-7 px-2 bg-white text-black rounded-md font-mono font-semibold hover:bg-gray-300 hover:border-gray-300'
                onClick={() => handleDeleteUser(user.id)}
            >x
                </button>
                </div>
            </>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
