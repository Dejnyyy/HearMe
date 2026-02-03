import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import HamburgerMenu from "./components/HamburgerMenu";
import {
  Calendar as CalendarIcon,
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  Music,
} from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-black">
      <HamburgerMenu />

      <main className="w-full">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* Header */}
          <section className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900 md:p-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={sessionData?.user?.image ?? "/default-userimage.png"}
                    alt="Profile picture"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full border-2 border-gray-100 object-cover shadow-sm dark:border-gray-700"
                  />
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 dark:bg-gray-900">
                    <CalendarIcon className="text-gold-500 h-4 w-4" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Calendar
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your voting history · {votes.length} votes total
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={toggleSortingOrder}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {sortByDateDesc ? (
                    <ArrowDownAZ className="h-4 w-4" />
                  ) : (
                    <ArrowUpAZ className="h-4 w-4" />
                  )}
                  {sortByDateDesc ? "Newest first" : "Oldest first"}
                </button>
                <Link
                  href="/voteToday"
                  className="bg-gold-500 hover:bg-gold-600 dark:hover:bg-gold-400 shadow-gold-500/20 rounded-xl px-5 py-2 text-sm font-bold text-white shadow-lg transition active:scale-95 dark:text-black"
                >
                  Vote today →
                </Link>
              </div>
            </div>
          </section>

          {/* List */}
          <section>
            <div className="custom-scroll max-h-[70vh] overflow-y-auto pr-1">
              {loading ? (
                // Loading skeletons
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
                    />
                  ))}
                </div>
              ) : votes.length === 0 ? (
                // Empty state
                <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                  <p className="mb-4 text-lg text-gray-500 dark:text-gray-400">
                    No votes recorded yet.
                  </p>
                  <Link
                    href="/voteToday"
                    className="bg-gold-500 hover:bg-gold-600 dark:hover:bg-gold-400 inline-block rounded-xl px-6 py-3 font-semibold text-white shadow-md transition dark:text-black"
                  >
                    Cast your first vote
                  </Link>
                </div>
              ) : (
                // Votes list
                <ul className="space-y-4">
                  {sortedVotes.map((vote, index) => {
                    const isOpen = expandedIndex === index;
                    return (
                      <li
                        key={`${vote.song}-${vote.createdAt}-${index}`}
                        className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                          isOpen
                            ? "border-gold-500/50 dark:border-gold-500/30 scale-[1.01] transform bg-white shadow-md dark:bg-gray-900"
                            : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                        }`}
                        onClick={() => toggleExpanded(index)}
                      >
                        <div className="cursor-pointer p-4">
                          <div className="flex items-center gap-4">
                            {/* Cover */}
                            <div className="relative flex-shrink-0">
                              <Image
                                src={vote.imageUrl || "/favicon.png"}
                                alt={`Cover for ${vote.song}`}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-xl bg-gray-100 object-cover shadow-sm"
                              />
                              <div
                                className={`absolute -bottom-2 -right-2 rounded-full border-2 border-white p-1 dark:border-gray-900 ${
                                  vote.voteType === "+"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {vote.voteType === "+" ? (
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                                {vote.song}
                              </h3>
                              <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                                {vote.artist}
                              </p>
                            </div>

                            {/* Date (Desktop) */}
                            <div className="hidden items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-400 dark:bg-gray-800 sm:flex">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(vote.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <div
                          className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-in-out ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden border-t border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-black/20">
                            <div className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
                              <div className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                                <span className="font-semibold">Date:</span>{" "}
                                {formatDate(vote.createdAt)}
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={`https://open.spotify.com/search/${encodeURIComponent(
                                    vote.song || "",
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#1DB954]/10 px-4 py-2 text-sm font-bold text-[#1DB954] transition-colors hover:bg-[#1DB954]/20"
                                >
                                  <Music className="h-4 w-4" />
                                  Open in Spotify
                                </a>
                              </div>
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
