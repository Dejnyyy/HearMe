import React, { useState, useEffect } from "react";
import { User } from '@prisma/client';
import FriendsPage from "./components/FriendList";
import HamburgerMenu from "./components/HamburgerMenu";

const Friends: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/najdiusery');
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
    }, []); 

    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-center"style={{ background: 'url("/HearMeBG4.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <FriendsPage userList={users} />
                <HamburgerMenu />
            </main>
        </>
    );
};

export default Friends;
