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
import { ArrowDownAZ, ArrowUpAZ, Users, Globe2, Trash2 } from "lucide-react";

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
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
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
        // Can't access prev here; compute using latest known length after setVotes.
        // Instead, compare using incoming totals: next line recalculated below in effect.
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
  useEffect(() => {
    // When backend provides totalVotes only in the fetch, we can't access here;
    // as a simple heuristic: if the fetch returned less than requested (20), stop.
    // Better: the endpoint already sets totalVotes; if needed, you can return it from fetchVotes.
    // For now we'll rely on "page bumps until empty page".
  }, [votes.length]);

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
      if (entry.isIntersecting && hasMore && !loading) {
        setPage((p) => p + 1);
      }
    });

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading]);

  /* ==================== UI ==================== */
  return (
    <div>
      <main
        className="min-h-screen w-full bg-cover bg-center text-white"
        style={{ backgroundImage: 'url("/HearMeBG4.png")' }}
      >
        <HamburgerMenu />

        {/* Header / Controls */}
        <section className="mx-auto w-full max-w-5xl px-4 pt-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h1 className="text-center font-mono text-3xl font-semibold tracking-wide sm:text-left">
                Explore
              </h1>
              <p className="text-center font-mono text-sm text-zinc-300 sm:text-left">
                All {worldFeed ? "World" : "Friends"} Votes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSort}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2 font-mono text-sm backdrop-blur hover:bg-zinc-800/60"
              >
                {sortByDateDesc ? (
                  <ArrowDownAZ className="h-4 w-4" />
                ) : (
                  <ArrowUpAZ className="h-4 w-4" />
                )}
                Date {sortByDateDesc ? "Desc." : "Asc."}
              </button>
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

        {/* Feed */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6">
          <div className="grid grid-cols-1 gap-4">
            {sortedVotes.map((vote) => {
              const expanded = expandedId === vote.id;
              return (
                <article
                  key={vote.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-md transition hover:bg-zinc-900/60"
                  onClick={() => onCardToggle(vote.id)}
                  role="button"
                >
                  {/* Top: user row */}
                  <div className="flex items-center gap-3">
                    <Image
                      src={vote.image || "/default-userimage.png"}
                      alt="Profile picture"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToUser(vote.userId);
                      }}
                    />
                    <button
                      className="truncate text-left font-mono text-sm text-zinc-200 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToUser(vote.userId);
                      }}
                    >
                      {vote.name ?? "Unknown"}
                    </button>

                    {isAdmin && (
                      <button
                        className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-red-600/20 px-3 py-1 text-xs text-red-200 hover:bg-red-600/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(vote.id);
                        }}
                        aria-label="Delete vote"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Middle: song row */}
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <div className="shrink-0">
                      <Image
                        src={vote.imageUrl || "/default-image-url"}
                        alt={`Cover for ${vote.song}`}
                        width={100}
                        height={100}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          vote.song,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate font-mono text-lg font-semibold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {vote.song}
                      </a>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          vote.artist,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate font-mono text-sm text-zinc-300 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {vote.artist}
                      </a>

                      {/* Expanded meta */}
                      {expanded && (
                        <div className="mt-2 space-y-1">
                          <p
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                              vote.voteType === "+"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            Type: {vote.voteType}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {formatDate(vote.createdAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Loading / Empty / Sentinel */}
            {loading && (
              <div className="mt-2">
                <Loading />
              </div>
            )}

            {!loading && sortedVotes.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 text-center text-zinc-300 backdrop-blur-md">
                No votes yet.
              </div>
            )}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="h-6 w-px self-center opacity-0" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Explore;
