import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import HamburgerMenu from "./components/HamburgerMenu";
import { api } from "~/utils/api";
import { db } from 'lib/prisma';
import { GetStaticProps } from 'next';
import UsersPage from "./components/Users";
import { User } from '@prisma/client';

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
  const { data: sessionData } = useSession();

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        {sessionData && <HamburgerMenu />}
        <UsersPage userList={userList} />
      </main>
    </>
  );
};

export default Uzivatele;
