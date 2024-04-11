import React, { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import { useSession } from "next-auth/react";

interface UsersPageProps {
  userList: User[];
  onDeleteUser: (userId: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ userList: initialUserList, onDeleteUser }) => {
  const [userList, setUserList] = useState<User[]>(initialUserList);
  const { data: sessionData } = useSession();

  useEffect(() => {
    setUserList(initialUserList);
  }, [initialUserList]);
  
  // Determine if the logged-in user is an admin
  const isLoggedInUserAdmin = userList.find(user => user.id === sessionData?.user.id)?.isAdmin;

  // Function to handle the add friend logic
  const onAddFriend = (userId: string) => {
    console.log(`Add friend with ID: ${userId}`); // Implement the logic to add a friend here
  };
  
  return (
    <div>
      <h1 className='text-white font-mono font-semibold text-xl'>User List</h1>
      <ul className='text-white font-mono mb-5 text-lg'>
        {userList.map(user => (
          <div className='flex items-center m-8' key={user.id}>
            <li className='flex-1'>
              {user.name}
            </li>
            {sessionData?.user.id !== user.id && (
              <button
                className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:bg-gray-300'
                onClick={() => onAddFriend(user.id)}>
                +
              </button>
            )}
            {isLoggedInUserAdmin && user.isAdmin !== true && (
              <button
                className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:bg-gray-300 hover:border-gray-300'
                onClick={() => onDeleteUser(user.id)}>
                x
              </button>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
