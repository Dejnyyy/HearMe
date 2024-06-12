import React, { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import Image from "next/image";
import SearchBar from './SearchBar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UsersPageProps {
  userList: User[];
}

interface ExtendedUser extends User {
  requestPending: boolean;
  isRequestReceived: boolean;
  isFriend: boolean;
  image: string;
}

const FriendsPage: React.FC<UsersPageProps> = ({ userList: initialUserList }) => {
  const { data: sessionData } = useSession();
  const [userList, setUserList] = useState<ExtendedUser[]>(initialUserList.map(user => ({
    ...user,
    requestPending: false,
    isRequestReceived: false,
    isFriend: false,
    image: user.image || '/default-userimage.png'
  })));
  const [filteredUserList, setFilteredUserList] = useState<ExtendedUser[]>(userList);
  const router = useRouter();

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
      setFilteredUserList(updatedUserList); 
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [initialUserList, sessionData]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/getUserByUserId?userId=${userId}`);
      if (!res.ok) {
        console.log('User fetch failed');
        return { name: 'Unknown', image: '/default-userimage.png' }; 
      }
      const userData = await res.json();
      return { name: userData.name, image: userData.image };
    } catch (error) {
      console.error('fetchUserDetails error:', error);
      return { name: 'Unknown', image: '/default-userimage.png' };
    }
  };

  const acceptFriendRequest = async (senderId: string) => {
    try {
      const response = await fetch('/api/acceptFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senderId: senderId, receiverId: sessionData?.user.id })
      });
  
      if (response.ok) {
        toast.success('Friend Request sent successfully', {
          className: "toast-message",
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await fetchUserData();
      } else {
        toast.error('Failed to accept friend request', {
          className: "toast-message",
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('An error occurred while accepting friend request', {
        className: "toast-message",
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const rejectFriendRequest = async (senderId: string) => {
    try {
      const response = await fetch('/api/declineFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senderId: senderId, receiverId: sessionData?.user.id })
      });

      if (response.ok) {
        toast.success('Friend request declined', {
          className: "toast-message",
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await fetchUserData();
      } else {
        toast.error('Failed to decline friend request', {
          className: "toast-message",
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('An error occurred while declining friend request', {
        className: "toast-message",
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
        toast.success('Friend Request sent successfully', {
          className: "toast-message",
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await fetchUserData();
      } else {
        toast.error('Failed to send friend request', {
          className: "toast-message",
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('An error occurred while sending friend request', {
        className: "toast-message",
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleSearch = (searchTerm: string) => {
    const lowercasedTerm = searchTerm.toLowerCase();
    setFilteredUserList(
      userList.filter(user => user.name.toLowerCase().includes(lowercasedTerm))
    );
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div>
      <ToastContainer />
      <div className="grid lg:grid-cols-2 grid-cols-1">
        <div className='m-4 mt-20 md:mt-4'>
          <h1 className='text-white font-mono font-semibold text-xl'>Friends</h1>
          <ul className='text-white font-mono mb-5 text-lg bg-gray-500 rounded-xl shadow-xl max-h-80 overflow-y-auto'>
            {userList.filter(user => user.isFriend).map(user => (
              <div className='flex items-center m-8 cursor-pointer' key={user.id} onClick={() => handleUserClick(user.id)}>
                <li className='flex-1'>
                  <div className='flex flex-row'>
                    <Image
                      src={user.image || '/default-userimage.png'}
                      alt="Profile picture"
                      width={50}
                      height={50}
                      unoptimized={true}
                      className='rounded-full w-12 h-12'
                    />
                    <p className='my-auto ml-4'>{user.name}</p>
                  </div>
                </li>
                {sessionData?.user.id !== user.id && (
                  <button disabled className='ml-2 border px-8 bg-green-200 text-green-700 rounded-xl font-mono font-semibold'>
                    Friends
                  </button>
                )}
              </div>
            ))}
          </ul>
        </div>

        <div className='m-4'>
          <h1 className='text-white font-mono font-semibold text-xl'>Pending Friend Requests</h1>
          <ul className='text-white font-mono mb-5 text-lg bg-gray-500 rounded-xl shadow-xl max-h-80 overflow-y-auto'>
            {userList.filter(user => !user.isFriend && user.isRequestReceived).map(user => (
              <div className='flex items-center m-8 cursor-pointer' key={user.id} onClick={() => handleUserClick(user.id)}>
                <li className='flex-1'>
                  <div className='flex flex-row m-auto'>
                    <Image
                      src={user.image || '/default-userimage.png'}
                      alt="Profile picture"
                      width={50}
                      height={50}
                      unoptimized={true}
                      className='rounded-full w-12 h-12'
                    />
                    <p className='my-auto ml-4'>{user.name}</p>
                  </div>
                  {user.isRequestReceived && !user.isFriend && (
                    <>
                    <div className='md:block flex flex-row text-center mx-auto'>
                    <button
                        className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:text-green-500'
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptFriendRequest(user.id);
                        }}>
                        Accept
                      </button>
                      <button
                        className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:text-red-500'
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectFriendRequest(user.id);
                        }}>
                        Reject
                      </button> 
                    </div>
                    </>
                  )}
                </li>
              </div>
            ))}
          </ul>
        </div>

        <div className='m-4'>
          <h1 className='text-white font-mono font-semibold text-xl'>Sent Requests</h1>
          <ul className='text-white font-mono mb-5 text-lg bg-gray-500 rounded-xl shadow-xl max-h-80 overflow-y-auto'>
            {userList.filter(user => user.requestPending).map(user => (
              <div className='flex items-center m-8 cursor-pointer' key={user.id} onClick={() => handleUserClick(user.id)}>
                <li className='flex-1'>
                  <div className='flex flex-row'>
                    <Image
                      src={user.image || '/default-userimage.png'}
                      alt="Profile picture"
                      width={1000}
                      height={1000}
                      unoptimized={true}
                      className='rounded-full w-12 h-12'
                    />
                    <p className='my-auto ml-4'>{user.name}</p>
                  </div>
                </li>
                <button disabled className='ml-2 border px-8 bg-gray-200 text-gray-500 rounded-xl font-mono font-semibold'>
                  Pending
                </button>
              </div>
            ))}
          </ul>
        </div>

        <div className='m-4'>
          <h1 className='text-white font-mono font-semibold text-xl'>Users</h1>
          <SearchBar onSearch={handleSearch} />
          <ul className='text-white font-mono mb-5 text-lg bg-gray-500 rounded-xl shadow-xl max-h-80 overflow-y-auto'>
            {filteredUserList.map(user => (
              <div className='flex items-center m-8 cursor-pointer' key={user.id} onClick={() => handleUserClick(user.id)}>
                <li className='flex-1'>
                  <div className='flex flex-row'>
                    <Image
                      src={user.image || '/default-userimage.png'}
                      alt="Profile picture"
                      width={50}
                      height={50}
                      unoptimized={true}
                      className='rounded-full w-12 h-12'
                    />
                    <p className='my-auto ml-4'>{user.name}</p>
                  </div>
                </li>
                {user.requestPending == false && !user.isRequestReceived && sessionData?.user.id !== user.id && !user.isFriend && (
                  <button
                    className='ml-2 border px-8 bg-white text-black rounded-xl hover:text-yellow-500 font-mono font-semibold'
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFriend(user.id);
                    }}>
                    Add
                  </button>
                )}
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
