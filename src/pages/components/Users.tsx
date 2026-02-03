import React, { useState, useEffect } from "react";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import SearchBar from "./SearchBar";
import Image from "next/image";
import { Trash2 } from "lucide-react";

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
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          All Users
        </h2>
        <div className="w-full max-w-sm">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <ul className="custom-scroll max-h-[600px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
          {filteredUserList.map((user) => (
            <li
              key={user.id}
              className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={user.image || "/default-userimage.png"}
                    alt="Profile picture"
                    width={48}
                    height={48}
                    unoptimized={true}
                    className="h-12 w-12 rounded-full border border-gray-100 object-cover dark:border-gray-700"
                  />
                  {user.isAdmin && (
                    <div className="absolute -bottom-1 -right-1 rounded-full border border-violet-200 bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-600 dark:border-violet-800 dark:bg-violet-900/50 dark:text-violet-300">
                      Admin
                    </div>
                  )}
                </div>
                <div>
                  <p className="group-hover:text-gold-600 dark:group-hover:text-gold-400 text-base font-semibold text-gray-900 transition-colors dark:text-white">
                    {user.name}
                  </p>
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    ID: {user.id.substring(0, 8)}...
                  </p>
                </div>
              </div>

              {isLoggedInUserAdmin && user.isAdmin !== true && (
                <button
                  className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(`Are you sure you want to delete ${user.name}?`)
                    ) {
                      onDeleteUser(user.id);
                    }
                  }}
                  title="Delete User"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 bg-gray-50 p-3 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
          Total users: {filteredUserList.length}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
