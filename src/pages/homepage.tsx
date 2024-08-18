import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
//import HamburgerMenu from "./components/HamburgerMenu";
import CircularLoading from "./components/CircularLoading";
import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { LinearGradient } from 'react-text-gradients'


const HomePage: React.FC<{ userList: User[] }> = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>HearMe</title>
        <meta name="description" content="Created by Dejny" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
       
      </main>
    </>
  );
};
export default HomePage;
