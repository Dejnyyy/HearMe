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

    const variants = {
        enter: (direction: number) => {
            return {
                x: direction > 0 ? 100 : -100,
                opacity: 0,
            };
        },
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => {
            return {
                x: direction < 0 ? 100 : -100,
                opacity: 0,
            };
        },
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black pt-10">
            <HamburgerMenu />
            <div className="flex items-center">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="w-10 h-10 flex items-center justify-center bg-gray-600 text-white rounded-full disabled:opacity-50 mr-4"
                >
                    <FaChevronLeft />
                </button>
                <div className="relative w-full flex justify-center overflow-hidden">
                    <AnimatePresence initial={false} custom={currentIndex}>
                        <motion.div
                            key={currentIndex}
                            custom={currentIndex}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.5 }}
                            className="absolute flex gap-4"
                        >
                            {users.slice(currentIndex, currentIndex + visibleUsersCount).map((user) => (
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
                        </motion.div>
                    </AnimatePresence>
                </div>
                <button
                    onClick={handleNext}
                    disabled={currentIndex >= users.length - visibleUsersCount}
                    className="w-10 h-10 flex items-center justify-center bg-gray-600 text-white rounded-full disabled:opacity-50 ml-4"
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default FriendsCircles;
