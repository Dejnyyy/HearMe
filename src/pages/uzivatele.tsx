import React, { useState, useEffect } from "react";
import { User } from '@prisma/client';
import UsersPage from "./components/Users";
import HamburgerMenu from "./components/HamburgerMenu";

const Uzivatele: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Call API route to fetch users when component mounts
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/najdiusery'); // Zde je cesta k novému koncovému bodu pro načítání uživatelů
                if (response.ok) {
                    const fetchedUsers = await response.json();
                    setUsers(fetchedUsers);
                } else {
                    console.error('Failed to fetch users:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []); // Effect runs only once when component mounts

    const handleDeleteUser = async (userId: string) => {
        try {
            // Call API route to delete user
            const response = await fetch('/api/deleteUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                const { deletedUserId } = await response.json();
                // Update state after successful deletion
                setUsers(prevUsers => prevUsers.filter((user: User) => user.id !== deletedUserId));
            } else {
                console.error('Failed to delete user:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <>
            <main className="flex min-h-screen bg-gray-950 flex-col items-center justify-center ">
                <UsersPage userList={users} onDeleteUser={handleDeleteUser} />
                <HamburgerMenu />
            </main>
        </>
    );
};

export default Uzivatele;
