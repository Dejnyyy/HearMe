import React, { useState } from "react"; // Import useState from 'react'
import { db } from 'lib/prisma';
import { GetStaticProps } from 'next';
import UsersPage from "./components/Users";
import { User } from '@prisma/client';
import HamburgerMenu from "./components/HamburgerMenu";

export const getStaticProps: GetStaticProps = async () => {
    try {
        const users = await db.user.findMany();
        // Convert date objects to ISO strings, handling possible null or undefined values
        const formattedUsers = users.map(user => ({
            ...user,
            emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null
        }));
        
        return { props: { userList: formattedUsers } };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { props: { userList: [] } };
    }
};


const Uzivatele: React.FC<{ userList: User[] }> = ({ userList }) => {
    // Declare and initialize the userList state
    const [users, setUsers] = useState<User[]>(userList);

    const handleDeleteUser = async (userId: string) => {
        try {
            // Delete user from the database
            await db.user.delete({
                where: {
                    id: userId
                }
            });
            // After successful deletion, you may want to update the user list displayed
            // For simplicity, you can refetch the user list, but in a real application, you might want to update the state directly
            const updatedUsers = await db.user.findMany();
            setUsers(updatedUsers); // Update the userList state with the updatedUsers
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-center bg-black">
                <UsersPage userList={users} onDeleteUser={handleDeleteUser} />
                <HamburgerMenu />
            </main>
        </>
    );
};

export default Uzivatele;
