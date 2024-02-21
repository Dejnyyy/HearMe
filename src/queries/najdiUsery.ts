import { PrismaClient } from '@prisma/client';
import { db } from 'lib/prisma';
import { GetStaticProps } from 'next';

// // Define a function to fetch and log users from the database
// export const getStaticProps: GetStaticProps = async () => {
//     // Declare the users variable
//     let users;

//     async function fetchUsers() {
//         try {
//             users = await db.user.findMany();
//             console.log('Users:', users);
//         } catch (error) {
//             console.error('There was a problem fetching users:', error);
//         }
//     }

//     await fetchUsers();

//     return { props: {} };
// };

export const getStaticProps: GetStaticProps = async () => {
    try {
        // Fetch users from the database
        const users = await db.user.findMany();
        console.log('Users:', users);
        // Return the users as props
        return { props: { users } };
    } catch (error) {
        console.error('There was a problem fetching users:', error);
        // If an error occurs, return an empty array as props
        return { props: { users: [] } };
    }
};



