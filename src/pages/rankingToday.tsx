import React, { useEffect, useMemo, useState } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Loading from "./components/Loading";
import { Globe2, Users, Trophy, Trash2, ChevronDown } from "lucide-react";

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

const rankGradient = (rank: number) => {
  switch (rank) {
    case 0:
      return "from-yellow-400 to-yellow-50"; // Gold
    case 1:
      return "from-zinc-300 to-zinc-50"; // Silver
    case 2:
      return "from-amber-700 to-amber-50"; // Bronze
    default:
      return "from-zinc-600 to-zinc-100";
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
    <div>
      <main
        className="min-h-screen w-full bg-cover bg-center text-white"
        style={{ backgroundImage: 'url("/HearMeBG4.png")' }}
      >
        <HamburgerMenu />

        {/* Header */}
        <section className="mx-auto w-full max-w-5xl px-4 pt-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h1 className="text-center font-mono text-3xl font-semibold tracking-wide sm:text-left">
                Ranking (Today)
              </h1>
              <p className="text-center font-mono text-sm text-zinc-300 sm:text-left">
                {worldFeed ? "World" : "Friends"} leaderboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFeed}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2 font-mono text-sm backdrop-blur hover:bg-zinc-800/60"
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
        <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6">
          {loading ? (
            <Loading />
          ) : votes.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-10 text-center backdrop-blur-md">
              <p className="font-mono text-lg">No votes today yet.</p>
              <Link
                href="/voteToday"
                className="mt-6 inline-block font-mono text-xl underline"
              >
                Vote
              </Link>
            </div>
          ) : (
            <>
              {/* Top 3 */}
              <h2 className="mt-2 text-center font-mono text-xl">Top 3</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {top.map((v, i) => (
                  <article
                    key={v.id}
                    className={`rounded-2xl border border-white/10 bg-gradient-to-b ${rankGradient(
                      i,
                    )} p-4 text-black shadow-sm`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold">
                        <Trophy className="h-4 w-4" />#{i + 1}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs">
                        Votes: <span className="font-bold">{v.voteCount}</span>
                      </div>
                    </div>

                    {/* user */}
                    <div className="flex items-center gap-3">
                      <Image
                        src={avatarSrc(v.image)}
                        alt="Profile picture"
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                        onClick={() => goUser(v.userId)}
                      />
                      <button
                        className="truncate text-left font-mono text-sm hover:underline"
                        onClick={() => goUser(v.userId)}
                      >
                        {v.name ?? "Unknown"}
                      </button>
                    </div>

                    {/* song */}
                    <div className="mt-4 flex flex-col items-center">
                      <Image
                        src={coverSrc(v.imageUrl)}
                        alt={`Cover for ${v.song}`}
                        width={160}
                        height={160}
                        className="h-40 w-40 rounded-lg object-cover"
                      />
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          v.song,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 truncate text-center font-mono text-base font-semibold hover:underline"
                      >
                        {v.song}
                      </a>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          v.artist,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-center font-mono text-sm text-zinc-700 hover:underline"
                      >
                        {v.artist}
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              {/* Others */}
              <h2 className="mt-8 text-center font-mono text-xl">
                All other votes
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {rest.map((v) => {
                  const expanded = expandedId === v.id;
                  return (
                    <article
                      key={v.id}
                      className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-md transition hover:bg-zinc-900/60"
                    >
                      {/* row: user + admin */}
                      <div className="flex items-center gap-3">
                        <Image
                          src={avatarSrc(v.image)}
                          alt="Profile picture"
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover"
                          onClick={() => goUser(v.userId)}
                        />
                        <button
                          className="truncate text-left font-mono text-sm text-zinc-200 hover:underline"
                          onClick={() => goUser(v.userId)}
                        >
                          {v.name ?? "Unknown"}
                        </button>
                        <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-200">
                          Votes:{" "}
                          <span className="font-bold">{v.voteCount}</span>
                        </div>
                        {isAdmin && (
                          <button
                            className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-red-600/20 px-3 py-1 text-xs text-red-200 hover:bg-red-600/30"
                            onClick={() => handleDelete(v.id)}
                            aria-label="Delete vote"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </div>

                      {/* row: song */}
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <Image
                          src={coverSrc(v.imageUrl)}
                          alt={`Cover for ${v.song}`}
                          width={96}
                          height={96}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <a
                            href={`https://open.spotify.com/search/${encodeURIComponent(
                              v.song,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate font-mono text-lg font-semibold hover:underline"
                          >
                            {v.song}
                          </a>
                          <a
                            href={`https://open.spotify.com/search/${encodeURIComponent(
                              v.artist,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate font-mono text-sm text-zinc-300 hover:underline"
                          >
                            {v.artist}
                          </a>

                          {expanded && (
                            <div className="mt-2 space-y-1">
                              <p
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                                  v.voteType === "+"
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                Type: {v.voteType}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {formatDate(v.createdAt)}
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          className="ml-auto inline-flex items-center gap-1 self-center rounded-full border border-white/10 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-700/60"
                          onClick={() => toggleExpanded(v.id)}
                        >
                          Details
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default RankingToday;
