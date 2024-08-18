import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
//import HamburgerMenu from "./components/HamburgerMenu";
import CircularLoading from "./components/CircularLoading";
import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { LinearGradient } from 'react-text-gradients'


const Home: React.FC<{ userList: User[] }> = () => {
  const { data: sessionData } = useSession();
  const userID = sessionData?.user?.id;
  const router = useRouter();

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;

      setScrollProgress(scrolled);

      if (scrolled >= 100) {
        router.push("/profile");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>HearMe</title>
        <meta name="description" content="Created by Dejny" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className="flex min-h-screen flex-col items-center justify-start bg-black"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "20px", // Add padding to allow space for scrolling
        }}
      >
        <div style={{ height: "500px" }}></div>
        <CircularLoading progress={188 - (188 * scrollProgress) / 100} />
      </main>
    </>
  );
};

export const AuthShowcase: React.FC<AuthShowcaseProps> = ({ userID }) => {
  const { data: sessionData } = useSession();
  console.log(sessionData);
  console.log(userID);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {sessionData && <div>{/* Content to show when authenticated */}</div>}
      <button
        className="mt-10 rounded-full bg-white px-10 py-3 font-mono font-semibold text-black no-underline transition hover:bg-white/50"
        onClick={
          sessionData ? () => void signOut() : () => void signIn("spotify")
        }
      >
        {sessionData ? "Sign out" : "Sign in via Spotify"}
      </button>
    </div>
  );
};

export default Home;
