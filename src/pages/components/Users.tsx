import React, { useState, useEffect } from "react";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import SearchBar from "./SearchBar";
import Image from "next/image";

interface UsersPageProps {
  userList: User[];
  onDeleteUser: (userId: string) => void;
}

interface ExtendedUser extends User {
  requestPending: boolean;
  isRequestReceived: boolean;
  isFriend: boolean;
}

const UsersPage: React.FC<UsersPageProps> = ({
  userList: initialUserList = [],
  onDeleteUser,
}) => {
  const { data: sessionData } = useSession();
  const [userList, setUserList] = useState<ExtendedUser[]>(
    (initialUserList ?? []).map((user) => ({
      ...user,
      requestPending: false,
      isRequestReceived: false,
      isFriend: false,
    })),
  );
  const [filteredUserList, setFilteredUserList] =
    useState<ExtendedUser[]>(userList);
  const router = useRouter();

  const isLoggedInUserAdmin = userList.find(
    (user) => user.id === sessionData?.user.id,
  )?.isAdmin;

  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (sessionData?.user?.id) {
        try {
          const responses = await Promise.all([
            fetch(`/api/viewPendingRequests?userId=${sessionData.user.id}`),
            fetch(`/api/viewFriendRequests?userId=${sessionData.user.id}`),
          ]);
          const [sentRequests, receivedRequests] = await Promise.all(
            responses.map((res) => res.json()),
          );

          const updatedUserList = initialUserList.map((user) => ({
            ...user,
            requestPending: sentRequests.some(
              (req: { receiverId: string }) => req.receiverId === user.id,
            ),
            isRequestReceived: receivedRequests.some(
              (req: { senderId: string }) => req.senderId === user.id,
            ),
            isFriend: false,
          }));
          setUserList(updatedUserList);
          setFilteredUserList(updatedUserList);
        } catch (error) {
          console.error("Failed to fetch friend requests:", error);
        }
      }
    };
    const fetchMyFriendships = async () => {
      if (sessionData?.user?.id) {
        try {
          const response = await fetch(
            `/api/findMyFriendships?userId=${sessionData.user.id}`,
          );
          if (!response.ok) {
            console.log("Failed to fetch friendships");
          }
          const friendships = await response.json();
          const friendIds = friendships.reduce(
            (
              acc: string[],
              friendship: { userId: string; friendId: string },
            ) => {
              if (friendship.userId !== sessionData.user.id) {
                acc.push(friendship.userId);
              }
              if (friendship.friendId !== sessionData.user.id) {
                acc.push(friendship.friendId);
              }
              return acc;
            },
            [],
          );

          const updatedUserList = initialUserList.map((user) => ({
            ...user,
            requestPending: false,
            isRequestReceived: false,
            isFriend: friendIds.includes(user.id),
          }));

          setUserList(updatedUserList);
          setFilteredUserList(updatedUserList);
        } catch (error) {
          console.error("Failed to fetch friendships:", error);
        }
      }
    };
    fetchFriendRequests();
    fetchMyFriendships();
  }, [initialUserList, sessionData]);

  const handleSearch = (searchTerm: string) => {
    const lowercasedTerm = searchTerm.toLowerCase();
    setFilteredUserList(
      userList.filter((user) =>
        (user.name ?? "").toLowerCase().includes(lowercasedTerm),
      ),
    );
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div>
      <h1 className="font-mono text-xl font-semibold text-white">User List</h1>
      <SearchBar onSearch={handleSearch} />
      <ul className="mb-5 max-h-80 overflow-y-auto rounded-xl bg-gray-500 p-1 font-mono text-lg text-white shadow-xl">
        {filteredUserList.map((user) => (
          <div
            className="m-8 flex cursor-pointer items-center"
            key={user.id}
            onClick={() => handleUserClick(user.id)}
          >
            <li className="flex-1">
              <div className="flex flex-row">
                <Image
                  src={user.image || "/default-userimage.png"}
                  alt="Profile picture"
                  width={50}
                  height={50}
                  unoptimized={true}
                  className="h-12 w-12 rounded-full"
                />
                <p className="my-auto ml-4">{user.name}</p>
              </div>
            </li>
            {isLoggedInUserAdmin && user.isAdmin !== true && (
              <button
                className="ml-2 rounded-xl border bg-white px-8 font-mono font-semibold text-black hover:bg-gray-300 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteUser(user.id);
                }}
              >
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
