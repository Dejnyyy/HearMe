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
    <div className="relative">
      <HamburgerMenu />
      <main
        className="min-h-screen w-full bg-black"
        style={{
          backgroundImage: 'url("/HearMeBG4.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* ✅ pass users + loading */}
          <FriendList users={users} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default Friends;
