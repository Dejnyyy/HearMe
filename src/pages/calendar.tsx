import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import HamburgerMenu from "./components/HamburgerMenu";

type Vote = {
  song: string;
  artist: string;
  imageUrl?: string | null;
  voteType?: string;
  createdAt: string | Date;
};

const Calendar: React.FC = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortByDateDesc, setSortByDateDesc] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // 🟢 Design style variables
  const glass =
    "bg-[rgba(18,18,18,0.86)] backdrop-blur-md border border-white/10 rounded-2xl";
  const h2 = "text-white/95 font-semibold font-mono text-lg sm:text-xl";
  const chip =
    "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold font-mono text-white/90 bg-white/10 border border-white/10";

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/getMyVotes");
        if (!response.ok) {
          console.log("Failed to fetch votes");
          setLoading(false);
          return;
        }
        const votesData = await response.json();
        setVotes(votesData || []);
      } catch (error) {
        console.error("Error fetching votes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  const formatDate = (dateLike: string | Date) => {
    const date = new Date(dateLike);
    return date
      .toLocaleString("cs-CZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", ", ");
  };

  const sortedVotes = useMemo(() => {
    const arr = [...votes];
    arr.sort((a, b) => {
      const aT = new Date(a.createdAt).getTime();
      const bT = new Date(b.createdAt).getTime();
      return sortByDateDesc ? bT - aT : aT - bT;
    });
    return arr;
  }, [votes, sortByDateDesc]);

  const toggleSortingOrder = () => setSortByDateDesc((v) => !v);
  const toggleExpanded = (index: number) =>
    setExpandedIndex(expandedIndex === index ? null : index);

  const sortingLabel = sortByDateDesc ? "Newest first" : "Oldest first";

  return (
    <div className="relative">
      <HamburgerMenu />

      <main
        className="min-h-screen w-full bg-black"
        style={{
          backgroundImage: 'url("/HearMeBG4.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* 🟣 HERO SECTION */}
          <section
            className={`${glass} flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between`}
          >
            <div className="flex items-center gap-3">
              <Image
                src={sessionData?.user?.image ?? "/default-userimage.png"}
                alt="Profile picture"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border border-white/20 object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Calendar</h1>
                <p className="text-sm text-white/60">
                  Your votes history in one place.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSortingOrder}
                className="hover:bg-white/15 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 transition active:scale-95"
              >
                {sortingLabel} {sortByDateDesc ? "↓" : "↑"}
              </button>
              <Link
                href="/voteToday"
                className="rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105 active:scale-95"
              >
                Vote today →
              </Link>
            </div>
          </section>

          {/* 🟣 VOTES LIST */}
          <section className={`${glass} p-4 sm:p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className={h2}>My Votes</h2>
              <span className={chip}>Total: {votes.length}</span>
            </div>

            {/* Scrollable section */}
            <div className="custom-scroll max-h-[70vh] overflow-y-auto pr-1">
              {loading ? (
                // Loading skeletons
                <ul className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex gap-3">
                        <div className="h-12 w-12 animate-pulse rounded-lg bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                          <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : votes.length === 0 ? (
                // Empty state
                <div className="border-white/12 rounded-xl border border-dashed p-8 text-center">
                  <p className="mb-3 text-white/70">No votes yet.</p>
                  <button
                    onClick={() => router.push("/voteToday")}
                    className="rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105 active:scale-95"
                  >
                    Vote now →
                  </button>
                </div>
              ) : (
                // Votes list
                <ul className="space-y-3">
                  {sortedVotes.map((vote, index) => {
                    const isOpen = expandedIndex === index;
                    return (
                      <li
                        key={`${vote.song}-${vote.createdAt}-${index}`}
                        className="hover:bg-white/7 cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 transition"
                        onClick={() => toggleExpanded(index)}
                      >
                        {/* Top section */}
                        <div className="sm:flex sm:items-center sm:gap-3">
                          {/* Cover */}
                          <div className="mx-auto flex-shrink-0 sm:mx-0">
                            <Image
                              src={vote.imageUrl || "/favicon.png"}
                              alt={`Cover for ${vote.song}`}
                              width={64}
                              height={64}
                              className="border-white/15 h-16 w-16 rounded-lg border object-cover"
                            />
                          </div>

                          {/* Song & artist */}
                          <div className="mt-2 min-w-0 flex-1 text-center sm:mt-0 sm:text-left">
                            <Link
                              href={`https://open.spotify.com/search/${encodeURIComponent(
                                vote.song || "",
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate font-semibold text-white hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {vote.song}
                            </Link>
                            <Link
                              href={`https://open.spotify.com/search/${encodeURIComponent(
                                vote.artist || "",
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-white/70 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {vote.artist}
                            </Link>
                          </div>

                          {/* User avatar + name */}
                          <div className="mt-3 flex items-center justify-center gap-2 sm:mt-0 sm:justify-end">
                            <Image
                              src={
                                sessionData?.user?.image ??
                                "/default-userimage.png"
                              }
                              alt="profile picture"
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-full border border-white/20 object-cover"
                            />
                            <p className="max-w-[160px] truncate text-sm text-white/80">
                              {sessionData?.user?.name}
                            </p>
                          </div>
                        </div>

                        {/* Expandable section */}
                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-80"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
                              <span
                                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                  vote.voteType === "+"
                                    ? "bg-green-400/15 border border-green-300/20 text-green-300"
                                    : "bg-red-400/15 border border-red-300/20 text-red-300"
                                }`}
                              >
                                {vote.voteType === "+" ? "Upvote" : "Downvote"}
                              </span>
                              <span className="text-sm text-white/60">
                                {formatDate(vote.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
