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
        <title>HearMe — Music Voting &amp; Discovery</title>
        <meta
          name="description"
          content="HearMe is a social music app where you vote for your favourite tracks every day, discover what your friends are listening to, and explore trending songs together."
        />
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hearme.dejny.eu/" />
        <meta property="og:title" content="HearMe — Music Voting &amp; Discovery" />
        <meta
          property="og:description"
          content="Vote for your favourite songs every day, see what your friends are listening to, and discover new music on HearMe."
        />
        <meta property="og:image" content="https://hearme.dejny.eu/hearmethumbnail.png" />
        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HearMe — Music Voting &amp; Discovery" />
        <meta
          name="twitter:description"
          content="Vote for your favourite songs every day, see what your friends are listening to, and discover new music on HearMe."
        />
        <meta name="twitter:image" content="https://hearme.dejny.eu/hearmethumbnail.png" />
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

        {/* App title — always visible for SEO */}
        {sessionData ? (
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
        ) : (
          <h1 className="mb-2 text-center font-mono text-3xl font-bold text-white">
            <LinearGradient gradient={["to left", "#FFD700, #ff68f0"]}>
              HearMe
            </LinearGradient>
          </h1>
        )}

        {/* Tagline */}
        {!sessionData && (
          <p className="mb-6 max-w-sm text-center font-mono text-sm text-gray-400">
            Vote for your favourite track every day. Discover what your friends
            are listening to. Explore trending music together.
          </p>
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

        {/* Footer credit */}
        <a
          href="https://dejny.eu"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 font-mono text-xs text-gray-600 transition hover:text-gray-400"
        >
          dejny.eu
        </a>
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
