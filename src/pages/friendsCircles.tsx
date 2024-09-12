import React, { useState, useEffect } from "react";
import { User } from '@prisma/client';
import HamburgerMenu from "./components/HamburgerMenu";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from 'next/router'; // Import useRouter

const FriendsCircles: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false); // Track animation status
    const visibleUsersCount = 6; // Number of users to display at a time
    const router = useRouter(); // Initialize router

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
        if (currentIndex > 0 && !isAnimating) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < users.length - visibleUsersCount && !isAnimating) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // Navigate to the profile page when a user's profile image is clicked
    const handleUserClick = (user: User) => {
        router.push(`/profile/${user.id}`); // Navigate to the dynamic profile route
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black pt-10">
            <HamburgerMenu />
            <div className="flex items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isAnimating ? 0 : 1 }}
                    transition={{ opacity: { duration: 0.3, delay: isAnimating ? 0 : 0.3 } }} // Transition only on appearing
                    className="mr-4"
                    style={{ opacity: isAnimating ? 0 : 1 }} // Instantly disappear
                >
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="w-10 h-10 flex items-center justify-center bg-gray-600 text-white rounded-full disabled:opacity-50"
                    >
                        <FaChevronLeft />
                    </button>
                </motion.div>
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
                                onAnimationStart={() => setIsAnimating(true)} // Disable buttons on start
                                onAnimationComplete={() => setIsAnimating(false)} // Enable buttons after animation
                            >
                                <div
                                    className="w-12 h-12 rounded-full bg-gray-300 cursor-pointer"
                                    onClick={() => handleUserClick(user)} // Navigate to profile when clicked
                                >
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
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isAnimating ? 0 : 1 }}
                    transition={{ opacity: { duration: 0.3, delay: isAnimating ? 0 : 0.3 } }} // Transition only on appearing
                    className="ml-4"
                    style={{ opacity: isAnimating ? 0 : 1 }} // Instantly disappear
                >
                    <button
                        onClick={handleNext}
                        disabled={currentIndex >= users.length - visibleUsersCount}
                        className="w-10 h-10 flex items-center justify-center bg-gray-600 text-white rounded-full disabled:opacity-50"
                    >
                        <FaChevronRight />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default FriendsCircles;
