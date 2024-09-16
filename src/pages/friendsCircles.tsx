import React, { useState, useEffect } from "react";
import { User } from '@prisma/client';
import HamburgerMenu from "./components/HamburgerMenu";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from 'next/router';

type VoteDetails = {
  userId: string;
  createdAt: string;
  song: string;
  artist: string;
  imageUrl: string | null;
};

const FriendsCircles: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [friendsLastVotes, setFriendsLastVotes] = useState<VoteDetails[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const visibleUsersCount = 6;
    const router = useRouter();

    useEffect(() => {
        // Fetch friends (users)
        const fetchFriends = async () => {
            try {
                const response = await fetch('/api/najdiusery'); // Replace with actual friends endpoint
                if (response.ok) {
                    const fetchedUsers = await response.json();
                    console.log('Fetched users:', fetchedUsers); // Log fetched users
                    setUsers(fetchedUsers);
                } else {
                    console.error('Failed to fetch users:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        // Fetch friends' last votes
        const fetchFriendsLastVotes = async () => {
            try {
                const response = await fetch('/api/getLastVotes?friends=true');
                if (response.ok) {
                    const votes = await response.json();
                    console.log("Fetched votes:", votes); // Log the fetched votes
                    setFriendsLastVotes(votes); // Store friends' last votes
                } else {
                    console.error('Failed to fetch friends\' last votes:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching friends\' last votes:', error);
            }
        };
        
        fetchFriends();
        fetchFriendsLastVotes();
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
        router.push(`/profile/${user.id}`);
    };

    const hasVotedInLast24Hours = (createdAt: string | null) => {
        if (!createdAt) return false;
        const now = new Date();
        const lastVotedDate = new Date(createdAt);
    
        const diffInHours = Math.abs(now.getTime() - lastVotedDate.getTime()) / (1000 * 60 * 60); // Difference in hours
        
        console.log(`Checking vote time: Last Voted Date = ${lastVotedDate}, Current Time = ${now}, Difference = ${diffInHours} hours`);
    
        return diffInHours <= 24;
    };

    // Helper function to find the vote details of a user by their ID
    const getLastVoteForUser = (userId: string): VoteDetails | null => {
        const lastVote = friendsLastVotes.find(vote => vote.userId === userId) || null;
        if (!lastVote) {
            console.log(`No last vote found for user with ID: ${userId}`);
        } else {
            console.log(`Found last vote for user with ID: ${userId}, Vote:`, lastVote);
        }
        return lastVote;
    };

    // Filter users who have voted in the last 24 hours
    const usersWhoVotedInLast24Hours = users.filter(user => {
        const lastVote = getLastVoteForUser(user.id);
        return lastVote && hasVotedInLast24Hours(lastVote.createdAt);
    });

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-black pt-10">
            <HamburgerMenu />
            <div className="flex items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isAnimating ? 0 : 1 }}
                    transition={{ opacity: { duration: 0.3, delay: isAnimating ? 0 : 0.3 } }}
                    className="mr-4"
                    style={{ opacity: isAnimating ? 0 : 1 }}
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
                        {users.slice(currentIndex, currentIndex + visibleUsersCount).map((user) => {
                            const lastVote = getLastVoteForUser(user.id);
                            return (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col items-center"
                                    onAnimationStart={() => setIsAnimating(true)}
                                    onAnimationComplete={() => setIsAnimating(false)}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-full bg-gray-300 cursor-pointer ${
                                            lastVote && hasVotedInLast24Hours(lastVote.createdAt) ? 'border-4 border-yellow-500' : ''
                                        }`}
                                        onClick={() => handleUserClick(user)}
                                    >
                                        <img
                                            src={user.image || "/default-userImage.png"}
                                            alt={`${user.name}'s profile`}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    <p className="text-white mt-1 text-sm">{user.name}</p>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isAnimating ? 0 : 1 }}
                    transition={{ opacity: { duration: 0.3, delay: isAnimating ? 0 : 0.3 } }}
                    className="ml-4"
                    style={{ opacity: isAnimating ? 0 : 1 }}
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
            {/* List of users who voted in the last 24 hours */}
            {usersWhoVotedInLast24Hours.length > 0 ? (
                <div className="mt-8 text-center">
                    <h2 className="text-white mb-2">Voted in Last 24 Hours:</h2>
                    <ul className="text-white">
                        {usersWhoVotedInLast24Hours.map(user => (
                            <li key={user.id}>{user.name}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="mt-8 text-center">
                    <h2 className="text-white mb-2">No users have voted in the last 24 hours.</h2>
                </div>
            )}
        </div>
    );
};

export default FriendsCircles;
