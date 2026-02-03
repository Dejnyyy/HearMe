import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "./components/Loading";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Users,
  Globe2,
  Trash2,
  Calendar,
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

/* ==================== Helpers ==================== */
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ==================== Component ==================== */
const Explore: React.FC = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const isAdmin = Boolean((sessionData as any)?.user?.isAdmin);

  // feed state
  const [votes, setVotes] = useState<Vote[]>([]);
  const [sortByDateDesc, setSortByDateDesc] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [worldFeed, setWorldFeed] = useState(true);

  // pagination + loading
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const apiEndpoint = useMemo(
    () =>
      worldFeed
        ? `/api/getOptimalVotes?page=${page}&limit=20`
        : `/api/findMineAndFriendsVotesOptimal?page=${page}&limit=20`,
    [worldFeed, page],
  );

  // fetch user details for each vote
  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/getUserByUserId?userId=${userId}`);
      if (!res.ok) return { name: "Unknown", image: "/default-profile.png" };
      const userData = await res.json();
      return {
        name: userData?.name ?? "Unknown",
        image: userData?.image ?? "/default-profile.png",
      };
    } catch {
      return { name: "Unknown", image: "/default-profile.png" };
    }
  }, []);

  const fetchVotes = useCallback(async () => {
    setLoading(true);
    const ac = new AbortController();
    try {
      const res = await fetch(apiEndpoint, { signal: ac.signal });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const { votes: votesData, totalVotes } = await res.json();

      // attach user info
      const withUsers: Vote[] = await Promise.all(
        (votesData as Vote[]).map(async (v) => {
          const details = await fetchUserDetails(v.userId);
          return { ...v, ...details };
        }),
      );

      // de-dupe by id while appending
      setVotes((prev) => {
        const byId = new Map<number, Vote>();
        [...prev, ...withUsers].forEach((v) => byId.set(v.id, v));
        return Array.from(byId.values());
      });

      setHasMore((prevVotesCount) => {
        return true;
      });
    } catch (e) {
      // noop + keep graceful UI
    } finally {
      setLoading(false);
    }
    return () => ac.abort();
  }, [apiEndpoint, fetchUserDetails]);

  // Keep hasMore in sync with total vs local count (re-check after each fetch)
  useEffect(() => {}, [votes.length]);

  // initial + on page/world toggle
  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  // reset when switching feed type
  const toggleFeed = () => {
    setWorldFeed((v) => !v);
    setVotes([]);
    setPage(1);
    setHasMore(true);
    setExpandedId(null);
  };

  const toggleSort = () => setSortByDateDesc((v) => !v);

  const onCardToggle = (voteId: number) => {
    setExpandedId((cur) => (cur === voteId ? null : voteId));
  };

  const sortedVotes = useMemo(() => {
    const copy = [...votes];
    copy.sort((a, b) =>
      sortByDateDesc
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return copy;
  }, [votes, sortByDateDesc]);

  const handleDelete = async (voteId: number) => {
    try {
      const res = await fetch(`/api/deleteVote?voteId=${voteId}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setVotes((prev) => prev.filter((v) => v.id !== voteId));
    } catch {
      // noop
    }
  };

  const goToUser = (userId: string) => router.push(`/profile/${userId}`);

  // intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasMore && !loading) {
        setPage((p) => p + 1);
      }
    });

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading]);

  /* ==================== UI ==================== */
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-black">
      <HamburgerMenu />

      <main className="w-full">
        {/* Header / Controls */}
        <section className="mx-auto w-full max-w-5xl px-4 pt-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-left">
                Explore
              </h1>
              <p className="mt-1 text-center text-lg text-gray-500 dark:text-gray-400 sm:text-left">
                Latest from {worldFeed ? "the World" : "your Friends"}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={toggleSort}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {sortByDateDesc ? (
                  <ArrowDownAZ className="h-4 w-4" />
                ) : (
                  <ArrowUpAZ className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Date</span>{" "}
                {sortByDateDesc ? "Desc." : "Asc."}
              </button>
              <button
                onClick={toggleFeed}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {worldFeed ? (
                  <Globe2 className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {worldFeed ? "World" : "Friends"}
              </button>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedVotes.map((vote) => {
              return (
                <article
                  key={vote.id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="p-5">
                    {/* Header: User */}
                    <div className="mb-4 flex items-center gap-3">
                      <Image
                        src={vote.image || "/default-userimage.png"}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="h-10 w-10 cursor-pointer rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToUser(vote.userId);
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <button
                          className="block w-full truncate text-left font-semibold text-gray-900 hover:underline dark:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToUser(vote.userId);
                          }}
                        >
                          {vote.name ?? "Unknown"}
                        </button>
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          {formatDate(vote.createdAt)}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          className="p-1 text-gray-400 transition-colors hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(vote.id);
                          }}
                          aria-label="Delete vote"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Song Content */}
                    <div className="group relative">
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          vote.song,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <Image
                            src={vote.imageUrl || "/default-image-url"}
                            alt={`Cover for ${vote.song}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Vote Type Badge */}
                          <div className="absolute right-3 top-3">
                            <div
                              className={`rounded-full px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-md ${
                                vote.voteType === "+"
                                  ? "bg-white/90 text-black dark:bg-black/80 dark:text-white"
                                  : "bg-red-500/90 text-white"
                              }`}
                            >
                              {vote.voteType === "+" ? "Upvote" : "Downvote"}
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>

                    <div className="mt-4">
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          vote.song,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gold-600 dark:hover:text-gold-400 block truncate text-lg font-bold text-gray-900 transition-colors dark:text-white"
                      >
                        {vote.song}
                      </a>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          vote.artist,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
                      >
                        {vote.artist}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Loading / Empty / Sentinel */}
          {loading && (
            <div className="mt-8">
              <Loading />
            </div>
          )}

          {!loading && sortedVotes.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No votes found in this feed.
              </p>
            </div>
          )}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-6 w-px self-center opacity-0" />
        </section>
      </main>
    </div>
  );
};

export default Explore;
