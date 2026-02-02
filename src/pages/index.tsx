import React, { useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { LinearGradient } from "react-text-gradients";
import { User } from "@prisma/client";
import { useRouter } from "next/router";

interface HomeProps {
  userList: User[];
}

const Home: React.FC<HomeProps> = () => {
  const { data: sessionData, status } = useSession();
  const router = useRouter();

  // Auto-redirect logged in users to the app
  useEffect(() => {
    if (status === "authenticated" && sessionData) {
      router.push("/profile");
    }
  }, [status, sessionData, router]);

  return (
    <>
      <Head>
        <title>HearMe</title>
        <meta name="description" content="Created by Dejny" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        {/* Logo */}
        <Image
          src="/favicon.png"
          alt="HearMe Logo"
          width={200}
          height={200}
          className="m-4 w-64"
          priority
        />

        {/* Greeting */}
        {sessionData && (
          <h1 className="mb-6 text-center font-mono text-lg font-semibold text-white">
            Hello,{" "}
            <span className="cursor-pointer underline">
              {sessionData.user?.name}
            </span>{" "}
            welcome to{" "}
            <LinearGradient gradient={["to left", "#FFD700, #ff68f0"]}>
              HearMe
            </LinearGradient>
          </h1>
        )}

        {/* Auth Buttons */}
        <AuthShowcase />

        {/* Enter App Button */}
        {sessionData && (
          <button
            onClick={() => router.push("/profile")}
            className="mt-8 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 px-8 py-3 font-mono font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl active:scale-95"
          >
            Enter App →
          </button>
        )}
      </main>
    </>
  );
};

interface AuthShowcaseProps {
  userID?: string;
}

const AuthShowcase: React.FC<AuthShowcaseProps> = () => {
  const { data: sessionData, status } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        className="mt-6 rounded-full bg-white px-10 py-3 font-mono font-semibold text-black shadow-md transition hover:scale-105 hover:bg-white/70 active:scale-95"
        onClick={() =>
          sessionData ? signOut({ callbackUrl: "/" }) : signIn("spotify")
        }
        disabled={status === "loading"}
      >
        {status === "loading"
          ? "Loading..."
          : sessionData
            ? "Sign out"
            : "Sign in via Spotify"}
      </button>
    </div>
  );
};

export default Home;
