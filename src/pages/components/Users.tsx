import React, { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import { useSession } from "next-auth/react";
import { NextRequest } from 'next/server'; 

interface UsersPageProps {
  userList: User[];
  onDeleteUser: (userId: string) => void;
}

interface ExtendedUser extends User {
  requestPending: boolean;
}

const UsersPage: React.FC<UsersPageProps> = ({ userList: initialUserList, onDeleteUser }) => {
  const { data: sessionData } = useSession();
  const [userList, setUserList] = useState<ExtendedUser[]>(initialUserList.map(user => ({
    ...user,
    requestPending: false
  })));
  
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (sessionData?.user?.id) {
        try {
          const response = await fetch(`/api/viewPendingRequests?userId=${sessionData.user.id}`);
          if (response.ok) {
            const pendingRequests = await response.json();
            const updatedUserList = initialUserList.map(user => ({
              ...user,
              requestPending: pendingRequests.some(req=> req.receiverId === user.id)
            }));
            setUserList(updatedUserList);
          }
        } catch (error) {
          console.error('Failed to fetch pending friend requests:', error);
        }
      }
    };

    fetchPendingRequests();
  }, [initialUserList, sessionData]);
  
  // Determine if the logged-in user is an admin
  const isLoggedInUserAdmin = userList.find(user => user.id === sessionData?.user.id)?.isAdmin;

  // Function to handle the add friend logic
  const onAddFriend = async (userId: string) => {
    console.log(`Add friend with ID: ${userId}`); 
    console.log(`Logged in user ID: ${sessionData?.user.id}`);
    
    const senderId = sessionData?.user.id;
    
  try {
    const response = await fetch('/api/sendFriendRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ senderId, receiverId: userId })
    });

    if (response.ok) {
      // You can add more logic here to handle a successful friend request send
      console.log('Friend request sent successfully');
    } else {
      console.log('Failed to send friend request');
    }
  } catch (error) {
    console.error('Error sending friend request:', error as Error);
  }
  };
  
  return (
    <div>
      <h1 className='text-white font-mono font-semibold text-xl'>User List</h1>
      <ul className='text-white font-mono mb-5 text-lg'>
        {userList.map(user => (console.log(user.requestPending),
          <div className='flex items-center m-8' key={user.id}>
            <li className='flex-1'>
              {user.name}
            </li>
            {sessionData?.user.id !== user.id && (
              <button
                className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:bg-gray-300'
                onClick={() => onAddFriend(user.id)}
                disabled={user.requestPending}>
                {user.requestPending ? 'Pending' : 'Add'}
              </button>
            )}
            {isLoggedInUserAdmin && user.isAdmin !== true && (
              <button
                className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:bg-gray-300 hover:border-gray-300'
                onClick={() => onDeleteUser(user.id)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
