import React, { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import { useSession } from "next-auth/react";

interface UsersPageProps {
  userList: User[];
}

interface ExtendedUser extends User {
  requestPending: boolean;
  isRequestReceived: boolean;
  isFriend: boolean;
}

const FriendsPage: React.FC<UsersPageProps> = ({ userList: initialUserList }) => {
  const { data: sessionData } = useSession();
  const [userList, setUserList] = useState<ExtendedUser[]>(initialUserList.map(user => ({
    ...user,
    requestPending: false,
    isRequestReceived: false,
    isFriend: false 
  })));

  useEffect(() => {
    const fetchUserData = async () => {
      if (!sessionData?.user?.id) return;
      try {
        const responses = await Promise.all([
          fetch(`/api/viewPendingRequests?userId=${sessionData.user.id}`),
          fetch(`/api/viewFriendRequests?userId=${sessionData.user.id}`),
          fetch(`/api/findMyFriendships?userId=${sessionData.user.id}`)
        ]);
        const [sentRequests, receivedRequests, friendships] = await Promise.all(responses.map(res => res.json()));

        const friendIds = new Set(friendships.map(f => f.userId === sessionData.user.id ? f.friendId : f.userId));
        const updatedUserList = initialUserList.map(user => ({
          ...user,
          requestPending: sentRequests.some(req => req.receiverId === user.id),
          isRequestReceived: receivedRequests.some(req => req.senderId === user.id),
          isFriend: friendIds.has(user.id)
        }));
        setUserList(updatedUserList);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [initialUserList, sessionData]);

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
            body: JSON.stringify({ senderId: senderId, receiverId: sessionData?.user.id})
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
      <h1 className='text-white font-mono font-semibold text-xl'>Friends</h1>
      <ul className='text-white font-mono mb-5 text-lg'>
        {userList.filter(user => user.isFriend).map(user => (
          <div className='flex items-center m-8' key={user.id}>
            <li className='flex-1'>
              {user.name}
            </li>
            {sessionData?.user.id !== user.id && (
              <button disabled className='ml-2 border px-8 bg-green-200 text-green-700 rounded-xl font-mono font-semibold'>
                Friends
              </button>
            )}
          </div>
        ))}
      </ul>
      <h1 className='text-white font-mono font-semibold text-xl'>Pending Friend Requests</h1>
      <ul className='text-white font-mono mb-5 text-lg'>
        {userList.filter(user => !user.isFriend && user.isRequestReceived).map(user => (
          <div className='flex items-center m-8' key={user.id}>
            <li className='flex-1'>{user.name}
            
            {user.isRequestReceived && !user.isFriend && (
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
        )}</li>
          </div>
        ))}
      </ul>

      <h1 className='text-white font-mono font-semibold text-xl'>Sent Requests</h1>
      <ul className='text-white font-mono mb-5 text-lg'>
        {userList.filter(user => user.requestPending).map(user => (
          <div className='flex items-center m-8' key={user.id}>
            <li className='flex-1'>{user.name}</li>
            <button disabled className='ml-2 border px-8 bg-gray-300 text-gray-500 rounded-xl font-mono font-semibold'>
              Pending
            </button>
          </div>
        ))}
      </ul>
      <h1 className='text-white font-mono font-semibold text-xl'>Users</h1>
      <ul className='text-white font-mono mb-5 text-lg'>
        {userList.map(user => (
          <div className='flex items-center m-8' key={user.id}>
            <li className='flex-1'>
              {user.name}
            </li>
            {user.requestPending == false && !user.isRequestReceived&& sessionData?.user.id !== user.id && user.isFriend&&(
          <button
            className='ml-2 border px-8  bg-green-200 text-green-700 rounded-xl font-mono font-semibold'
            disabled>
            Friends
          </button> 
        )} 
        {user.requestPending == false && !user.isRequestReceived&& sessionData?.user.id !== user.id&& !user.isFriend &&(
          <button
            className='ml-2 border px-8 bg-white text-black rounded-xl hover:text-yellow-500 font-mono font-semibold'
            onClick={() => onAddFriend(user.id)}>
            Add
          </button> 
        )} 
          </div>
        ))}
      </ul>
    </div>
  );
};

export default FriendsPage;