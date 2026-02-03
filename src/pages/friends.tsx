import React, { useEffect, useState } from "react";
import type { User } from "@prisma/client";
import HamburgerMenu from "./components/HamburgerMenu";
import FriendList from "./components/FriendList";

const Friends: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/najdiusery", {
          signal: controller.signal,
        });
        const data = res.ok ? await res.json() : [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-black">
      <HamburgerMenu />
      <main className="w-full">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-left">
            Friends
          </h1>
          <p className="mb-8 text-center text-gray-500 dark:text-gray-400 sm:text-left">
            Discover and connect with other music lovers.
          </p>
          <FriendList users={users} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default Friends;
