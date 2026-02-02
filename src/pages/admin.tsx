import React, { useState, useEffect } from "react";
import { User } from "@prisma/client";
import UsersPage from "./components/Users";
import HamburgerMenu from "./components/HamburgerMenu";

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/najdiusery");
        if (response.ok) {
          const fetchedUsers = await response.json();
          setUsers(fetchedUsers);
        } else {
          console.error("Failed to fetch users:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch("/api/deleteUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const { deletedUserId } = await response.json();
        setUsers((prevUsers) =>
          prevUsers.filter((user: User) => user.id !== deletedUserId),
        );
      } else {
        console.error("Failed to delete user:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <UsersPage userList={users} onDeleteUser={handleDeleteUser} />
      </main>
    </div>
  );
};

export default Admin;
