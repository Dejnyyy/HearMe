// UsersPage.tsx
import React, { useState } from 'react';
import { User } from '@prisma/client';

interface UsersPageProps {
  userList: User[];
  onDeleteUser: (userId: string) => void;
}



const UsersPage: React.FC<UsersPageProps> = ({ userList: initialUserList, onDeleteUser }) => {
  const [userList, setUserList] = useState<User[]>(initialUserList);

  return (
    <div>
      <h1 className='text-white font-mono font-semibold text-xl'>User List</h1>
      <ul className='text-white font-mono mb-5 text-lg'>
        {userList.map(user => (
          <div className='flex m-8' key={user.id}>
            <li className=''>
              {user.name} {user.emailVerified && <span className='text-green-500'>(verified)</span>} 
            </li>
            <button
              className='ml-8 m-auto border h-7 px-2 bg-white text-black rounded-md font-mono font-semibold hover:bg-gray-300 hover:border-gray-300'
            onClick={() => onDeleteUser(user.id)}>
              x
            </button>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
