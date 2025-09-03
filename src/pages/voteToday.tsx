import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import SearchForm from "./components/SearchForm";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";

/* ==================== Types ==================== */
interface Artist {
  name: string;
}

interface SpotifyImage {
  url: string;
}

interface Album {
  images: SpotifyImage[];
}

interface Song {
  name: string;
  artists: Artist[];
  album: Album;
}

/* ==================== Helpers ==================== */
const getArtistsNames = (track: Song): string =>
  track?.artists?.length
    ? track.artists.map((a) => a.name).join(", ")
    : "Unknown Artist";

const getImageUrl = (track?: Song) => {
  // Prefer mid/large image, gracefully fall back
  return (
    track?.album?.images?.[1]?.url ??
    track?.album?.images?.[0]?.url ??
    track?.album?.images?.[2]?.url ??
    "/default-image-url"
  );
};

/* ==================== Component ==================== */
const Vote: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";
  const isAuthLoading = status === "loading";
  const userId = (session as any)?.user?.id ?? "";

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydrate selection from querystring or localStorage
  useEffect(() => {
    const { selectedSong: querySong } = router.query;
    if (typeof querySong === "string") {
      try {
        const parsed = JSON.parse(querySong) as Song;
        setSelectedSong(parsed);
        localStorage.setItem("selectedSong", querySong);
        return;
      } catch {
        // ignore parse error, fall back to localStorage
      }
    }
    // fallback: get from localStorage on mount
    const ls = localStorage.getItem("selectedSong");
    if (ls) {
      try {
        setSelectedSong(JSON.parse(ls) as Song);
      } catch {
        localStorage.removeItem("selectedSong");
      }
    }
  }, [router.query]);

  const artistNames = useMemo(
    () => (selectedSong ? getArtistsNames(selectedSong) : ""),
    [selectedSong],
  );
  const albumImage = useMemo(
    () => getImageUrl(selectedSong ?? undefined),
    [selectedSong],
  );

  const handleSongClick = (clickedSong: Song) => {
    setSelectedSong(clickedSong);
    try {
      localStorage.setItem("selectedSong", JSON.stringify(clickedSong));
    } catch {
      /* noop */
    }
  };

  const clearSelection = () => {
    setSelectedSong(null);
    localStorage.removeItem("selectedSong");
  };

  const handleVote = async (voteType: "+" | "-") => {
    if (!isUserLoggedIn) {
      toast.error("You need to be logged in to vote.");
      return;
    }
    if (!selectedSong) {
      toast.error("No song selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          song: selectedSong.name,
          voteType,
          artist: artistNames,
          imageUrl: albumImage,
        }),
      });

      if (!response.ok) {
        const msg =
          (await response.text()) || response.statusText || "Unknown error";
        toast.error("Vote failed: " + msg, {
          className: "toast-message",
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      toast.success("Thank you for your vote!", {
        className: "toast-message",
        position: "top-right",
        autoClose: 1800,
      });
      router.push("/profile");
    } catch (err) {
      toast.error("Vote failed", {
        className: "toast-message",
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <main
        className="min-h-screen w-full bg-cover bg-center text-white"
        style={{ backgroundImage: 'url("/HearMeBG4.png")' }}
      >
        <HamburgerMenu />

        {/* Header */}
        <section className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-8">
          <h1 className="font-mono text-xl font-semibold tracking-wide">
            Vote
          </h1>
          {!isUserLoggedIn && !isAuthLoading && (
            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300">
              Log in to submit your vote
            </span>
          )}
        </section>

        {/* Content */}
        <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 px-4 pb-16 pt-6 lg:grid-cols-2">
          {/* Left: Search */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 className="font-mono text-sm uppercase tracking-wider text-zinc-300">
                Search a track
              </h2>
            </div>
            <div className="max-h-[28rem] overflow-y-auto p-3 md:p-4">
              {/* Keep your existing search form; just pass the handler */}
              <SearchForm onSongClick={handleSongClick} />
            </div>
          </div>

          {/* Right: Selected */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 className="font-mono text-sm uppercase tracking-wider text-zinc-300">
                Selected track
              </h2>
              {selectedSong && (
                <button
                  onClick={clearSelection}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700/60"
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            {!selectedSong ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-zinc-400">
                <div className="h-14 w-14 rounded-2xl border border-white/10 bg-zinc-800/60" />
                <p className="max-w-sm text-sm">
                  Pick a song from the left to preview it here and cast your
                  vote.
                </p>
              </div>
            ) : (
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-zinc-800/60 p-3">
                  <div className="shrink-0">
                    <Image
                      src={albumImage}
                      alt={`Album cover for ${selectedSong.name}`}
                      width={80}
                      height={80}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-mono text-base font-semibold">
                      {selectedSong.name}
                    </div>
                    <div className="truncate text-sm text-zinc-400">
                      {artistNames}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-2 font-mono font-semibold text-black transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleVote("+")}
                    disabled={!isUserLoggedIn || isSubmitting || isAuthLoading}
                    aria-disabled={
                      !isUserLoggedIn || isSubmitting || isAuthLoading
                    }
                  >
                    <ThumbsUp className="h-5 w-5" />
                    Upvote
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-2 font-mono font-semibold text-black transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleVote("-")}
                    disabled={!isUserLoggedIn || isSubmitting || isAuthLoading}
                    aria-disabled={
                      !isUserLoggedIn || isSubmitting || isAuthLoading
                    }
                  >
                    <ThumbsDown className="h-5 w-5" />
                    Downvote
                  </button>
                </div>

                {/* Hints / states */}
                {!isUserLoggedIn && !isAuthLoading && (
                  <p className="mt-4 text-center text-sm text-yellow-300/90">
                    You need to be logged in to vote.
                  </p>
                )}
                {isSubmitting && (
                  <p className="mt-2 text-center text-sm text-zinc-400">
                    Submitting your vote…
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Vote;
