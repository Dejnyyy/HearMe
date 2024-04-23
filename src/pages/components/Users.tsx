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
  isRequestReceived: boolean;
  isFriend: boolean;
}

const UsersPage: React.FC<UsersPageProps> = ({ userList: initialUserList, onDeleteUser }) => {
  const { data: sessionData } = useSession();
  const [userList, setUserList] = useState<ExtendedUser[]>(initialUserList.map(user => ({
    ...user,
    requestPending: false,
    isRequestReceived: false,
    isFriend: false 
  })));
  
  const isLoggedInUserAdmin = userList.find(user => user.id === sessionData?.user.id)?.isAdmin;
  
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (sessionData?.user?.id) {
        try {
          const responses = await Promise.all([
            fetch(`/api/viewPendingRequests?userId=${sessionData.user.id}`),
            fetch(`/api/viewFriendRequests?userId=${sessionData.user.id}`)
          ]);

          const [sentRequests, receivedRequests] = await Promise.all(responses.map(res => res.json()));

          const updatedUserList = initialUserList.map(user => ({
            ...user,
            requestPending: sentRequests.some(req => req.receiverId === user.id),
            isRequestReceived: receivedRequests.some(req => req.senderId === user.id)
          }));
          setUserList(updatedUserList);
        } catch (error) {
          console.error('Failed to fetch friend requests:', error);
        }
      }
    };

    fetchFriendRequests();
  }, [initialUserList, sessionData]);
  
  // Determine if the logged-in user is an admin
  const acceptFriendRequest = async (senderId: string) => {
    try {
      const response = await fetch('/api/acceptFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senderId: senderId, receiverId: sessionData?.user.id})
      });
  
      if (response.ok) {
        console.log('Friend request accepted successfully');
        setUserList(prev => prev.map(user => 
          user.id === senderId ? { ...user, isFriend: true, isRequestReceived: false } : user
        ));
      } else {
        console.log('Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };
  
  const rejectFriendRequest = async (senderId: string) => {
    try {
        const response = await fetch('/api/declineFriendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ friendRequestId: senderId })
        });

        if (response.ok) {
            console.log('Friend request declined successfully');
            setUserList(prev => prev.map(user =>
                user.id === senderId ? { ...user, isRequestReceived: false } : user
            ));
        } else {
            console.log('Failed to decline friend request');
        }
    } catch (error) {
        console.error('Error declining friend request:', error);
    }
};
  
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
      {userList.map(user => (
  <div className='flex items-center m-8' key={user.id}>
    <li className='flex-1'>
      {user.name}
    </li>
    {sessionData?.user.id !== user.id && (
      <>
       {user.isFriend && (
          <button disabled className='ml-2 border px-8 bg-green-200 text-green-700 rounded-xl font-mono font-semibold'>
            Friends
          </button>
        )}
        {user.isRequestReceived && (
          <>
            <button
              className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:text-green-500'
              onClick={() => acceptFriendRequest(user.id)}>
              Accept
            </button>
            <button
              className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:text-red-500'
              onClick={() => rejectFriendRequest(user.id)}>
              Reject
            </button>
          </>
        )}
        {user.requestPending && !user.isRequestReceived && (
          <button
            disabled
            className='ml-2 border px-8 bg-gray-300 text-gray-500 rounded-xl font-mono font-semibold'>
            Pending
          </button>
        )}
        {!user.requestPending && !user.isRequestReceived && (
          <button
            className='ml-2 border px-8 bg-white text-black rounded-xl hover:text-yellow-500 hover:bg-black font-mono font-semibold'
            onClick={() => onAddFriend(user.id)}>
            Add
          </button>
        )}
      </>
    )}
    {isLoggedInUserAdmin && user.isAdmin !== true && (
      <button
        className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:bg-gray-300 hover:text-red-500'
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
