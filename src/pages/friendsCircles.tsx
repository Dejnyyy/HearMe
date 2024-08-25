import React, { useState, useEffect } from "react";
import { User } from '@prisma/client';
import HamburgerMenu from "./components/HamburgerMenu";

const FriendsCircles: React.FC = () => {
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
        <div className="flex min-h-screen items-start justify-center bg-black pt-10">
         <HamburgerMenu />
            <div className="flex flex-wrap justify-center gap-4">
                {users.map((user) => (
                    <div key={user.id} className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-300">
                            <img
                                src={user.image || "/default-userImage.png"}
                                alt={`${user.name}'s profile`}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <p className="text-white mt-1 text-sm">{user.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FriendsCircles;
