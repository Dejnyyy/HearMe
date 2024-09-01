import React, { useState, useEffect } from "react";
import { User } from '@prisma/client';
import HamburgerMenu from "./components/HamburgerMenu";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const FriendsCircles: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const visibleUsersCount = 6; // Number of users to display at a time

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

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < users.length - visibleUsersCount) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <div className="flex min-h-screen items-start justify-center bg-black pt-10">
            <HamburgerMenu />
            <div className="flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-4 overflow-hidden">
                    <AnimatePresence initial={false}>
                        {users.slice(currentIndex, currentIndex + visibleUsersCount).map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-300">
                                    <img
                                        src={user.image || "/default-userImage.png"}
                                        alt={`${user.name}'s profile`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <p className="text-white mt-1 text-sm">{user.name}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="flex justify-between w-full mt-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="w-10 h-10 flex items-center justify-center bg-gray-600 text-white rounded-full disabled:opacity-50"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex >= users.length - visibleUsersCount}
                        className="w-10 h-10 flex items-center justify-center bg-gray-600 text-white rounded-full disabled:opacity-50"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FriendsCircles;
