import React, { useEffect, useMemo, useState } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Loading from "./components/Loading";
import {
  Globe2,
  Users,
  Trophy,
  Trash2,
  ChevronDown,
  Music,
} from "lucide-react";

/* ==================== Types ==================== */
interface Vote {
  id: number;
  createdAt: string;
  song: string;
  artist: string;
  voteType: string; // '+' | '-'
  imageUrl?: string;
  userId: string;
  name?: string;
  image?: string;
}
interface VoteWithCount extends Vote {
  voteCount: number;
}

/* ==================== Helpers ==================== */
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("cs-CZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const coverSrc = (url?: string) => url || "/default-image-url";
const avatarSrc = (url?: string) => url || "/default-userimage.png";

const rankBorder = (rank: number) => {
  switch (rank) {
    case 0:
      return "border-yellow-400 dark:border-gold-500 ring-4 ring-yellow-400/20 dark:ring-gold-500/20"; // Gold
    case 1:
      return "border-gray-400 dark:border-gray-400 ring-4 ring-gray-400/20"; // Silver
    case 2:
      return "border-orange-600 dark:border-amber-700 ring-4 ring-orange-600/20 dark:ring-amber-700/20"; // Bronze
    default:
      return "border-gray-200 dark:border-gray-700";
  }
};

/* ==================== Component ==================== */
const RankingToday: React.FC = () => {
  const { data: sessionData } = useSession();
  const isAdmin = Boolean((sessionData as any)?.user?.isAdmin);
  const router = useRouter();

  const [votes, setVotes] = useState<VoteWithCount[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [worldFeed, setWorldFeed] = useState(true);
  const [loading, setLoading] = useState(true);

  const apiEndpoint = worldFeed
    ? "/api/getVotesCountToday"
    : "/api/findMineFriendsVotesCount";

  useEffect(() => {
    const fetchUserDetails = async (userId: string) => {
      try {
        const res = await fetch(`/api/getUserByUserId?userId=${userId}`);
        if (!res.ok) return { name: "Unknown", image: "/default-profile.png" };
        const data = await res.json();
        return {
          name: data?.name ?? "Unknown",
          image: data?.image ?? "/default-profile.png",
        };
      } catch {
        return { name: "Unknown", image: "/default-profile.png" };
      }
    };

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiEndpoint);
        if (!res.ok) {
          setVotes([]);
          return;
        }
        const base: VoteWithCount[] = await res.json();
        const withUsers = await Promise.all(
          base.map(async (v) => ({
            ...v,
            ...(await fetchUserDetails(v.userId)),
          })),
        );
        setVotes(withUsers);
      } catch {
        setVotes([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [apiEndpoint]);

  const sorted = useMemo(
    () => [...votes].sort((a, b) => b.voteCount - a.voteCount),
    [votes],
  );
  const top = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const toggleFeed = () => setWorldFeed((v) => !v);
  const toggleExpanded = (id: number) =>
    setExpandedId((cur) => (cur === id ? null : id));

  const handleDelete = async (voteId: number) => {
    try {
      const res = await fetch(`/api/deleteVote?voteId=${voteId}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setVotes((prev) => prev.filter((v) => v.id !== voteId));
    } catch {
      /* noop */
    }
  };

  const goUser = (userId: string) => router.push(`/profile/${userId}`);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-black">
      <HamburgerMenu />

      <main className="w-full">
        {/* Header */}
        <section className="mx-auto w-full max-w-5xl px-4 pt-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-left">
                Ranking (Today)
              </h1>
              <p className="mt-1 text-center text-lg text-gray-500 dark:text-gray-400 sm:text-left">
                {worldFeed ? "World" : "Friends"} leaderboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFeed}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {worldFeed ? (
                  <Globe2 className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                Showing: {worldFeed ? "World" : "Friends"}
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8">
          {loading ? (
            <Loading />
          ) : votes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-16 text-center dark:border-gray-700 dark:bg-gray-900/50">
              <p className="text-lg font-medium text-gray-500">
                No votes today yet.
              </p>
              <Link
                href="/voteToday"
                className="text-gold-600 mt-4 inline-block font-bold hover:underline"
              >
                Cast the first vote →
              </Link>
            </div>
          ) : (
            <>
              {/* Top 3 */}
              <div className="mt-4 grid grid-cols-1 items-end gap-6 md:grid-cols-3">
                {top.map((v, i) => (
                  <article
                    key={v.id}
                    className={`relative rounded-3xl border ${rankBorder(
                      i,
                    )} bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 dark:bg-gray-900 ${
                      i === 0
                        ? "z-10 md:order-2 md:-mt-8"
                        : i === 1
                          ? "md:order-1"
                          : "md:order-3"
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm ${
                          i === 0
                            ? "bg-yellow-400 text-black"
                            : i === 1
                              ? "bg-gray-200 text-gray-800"
                              : "bg-orange-600 text-white"
                        }`}
                      >
                        <Trophy className="h-4 w-4" /> #{i + 1}
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {v.voteCount}
                        </span>{" "}
                        Votes
                      </div>
                    </div>

                    {/* Song Cover */}
                    <div className="mt-6 flex justify-center">
                      <Image
                        src={coverSrc(v.imageUrl)}
                        alt={`Cover for ${v.song}`}
                        width={140}
                        height={140}
                        className="h-36 w-36 rounded-2xl object-cover shadow-md"
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          v.song,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gold-600 dark:hover:text-gold-400 block truncate text-lg font-bold text-gray-900 transition-colors dark:text-white"
                      >
                        {v.song}
                      </a>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          v.artist,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
                      >
                        {v.artist}
                      </a>
                    </div>

                    {/* User */}
                    <div className="mt-6 flex justify-center border-t border-gray-100 pt-4 dark:border-gray-800">
                      <div
                        className="group flex cursor-pointer items-center gap-2"
                        onClick={() => goUser(v.userId)}
                      >
                        <Image
                          src={avatarSrc(v.image)}
                          alt="Profile picture"
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                        />
                        <span className="truncate text-sm font-semibold text-gray-700 group-hover:text-black dark:text-gray-300 dark:group-hover:text-white">
                          {v.name ?? "Unknown"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Others */}
              {rest.length > 0 && (
                <>
                  <h2 className="mb-6 mt-12 text-xl font-bold text-gray-900 dark:text-white">
                    All other votes
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    {rest.map((v) => {
                      const expanded = expandedId === v.id;
                      return (
                        <article
                          key={v.id}
                          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                        >
                          <div className="flex items-center gap-4">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500 dark:bg-gray-800">
                              #{votes.indexOf(v) + 1}
                            </span>

                            <Image
                              src={coverSrc(v.imageUrl)}
                              alt={`Cover for ${v.song}`}
                              width={56}
                              height={56}
                              className="h-14 w-14 rounded-lg object-cover"
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-bold text-gray-900 dark:text-white">
                                {v.song}
                              </p>
                              <p className="truncate text-sm font-medium text-gray-500">
                                {v.artist}
                              </p>
                            </div>

                            <div className="hidden items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1 dark:border-gray-700 dark:bg-gray-800 sm:flex">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {v.voteCount}
                              </span>
                              <span className="text-xs uppercase text-gray-500">
                                Votes
                              </span>
                            </div>

                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              onClick={() => toggleExpanded(v.id)}
                            >
                              <ChevronDown
                                className={`h-5 w-5 transition-transform ${
                                  expanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* Expanded Details */}
                          {expanded && (
                            <div className="mt-4 flex flex-col items-start justify-between gap-4 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:items-center">
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-gray-500">
                                  Voted by:
                                </div>
                                <div
                                  className="flex cursor-pointer items-center gap-2 hover:opacity-80"
                                  onClick={() => goUser(v.userId)}
                                >
                                  <Image
                                    src={avatarSrc(v.image)}
                                    alt="Profile"
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 rounded-full"
                                  />
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {v.name ?? "Unknown"}
                                  </span>
                                </div>
                              </div>

                              {isAdmin && (
                                <button
                                  className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                                  onClick={() => handleDelete(v.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete Vote
                                </button>
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default RankingToday;
