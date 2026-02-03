import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import SearchForm from "./components/SearchForm";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, X, Music, Search } from "lucide-react";

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

const getArtistsNames = (track: Song): string =>
  track?.artists?.length
    ? track.artists.map((a) => a.name).join(", ")
    : "Unknown Artist";

const getImageUrl = (track?: Song) => {
  return (
    track?.album?.images?.[1]?.url ??
    track?.album?.images?.[0]?.url ??
    track?.album?.images?.[2]?.url ??
    "/default-image-url"
  );
};

const Vote: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";
  const isAuthLoading = status === "loading";
  const userId = (session as any)?.user?.id ?? "";

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const { selectedSong: querySong } = router.query;
    if (typeof querySong === "string") {
      try {
        const parsed = JSON.parse(querySong) as Song;
        setSelectedSong(parsed);
        localStorage.setItem("selectedSong", querySong);
        return;
      } catch {
        // ignore parse error
      }
    }
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
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      toast.success("Thank you for your vote!", {
        position: "top-right",
        autoClose: 1800,
      });
      router.push("/profile");
    } catch (err) {
      toast.error("Vote failed", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-black">
      <HamburgerMenu />

      <main className="px-4 pb-16 pt-8">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-4xl text-center sm:text-left">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Vote
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Search and vote for your song of the day
          </p>
          {!isUserLoggedIn && !isAuthLoading && (
            <div className="bg-gold-50 dark:bg-gold-500/10 border-gold-200 dark:border-gold-500/20 mt-6 inline-block rounded-xl border px-4 py-3">
              <p className="text-gold-700 dark:text-gold-400 text-sm font-medium">
                Log in to submit your vote
              </p>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Search */}
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
              <Search className="h-5 w-5 text-gray-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Search Track
              </h2>
            </div>
            <div className="custom-scrollbar max-h-[600px] flex-1 overflow-y-auto p-6">
              <SearchForm onSongClick={handleSongClick} />
            </div>
          </div>

          {/* Right: Selected */}
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Selected Track
              </h2>
              {selectedSong && (
                <button
                  onClick={clearSelection}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-center">
              {!selectedSong ? (
                <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-50 text-gray-300 dark:bg-gray-800 dark:text-gray-600">
                    <Music className="h-10 w-10" />
                  </div>
                  <p className="max-w-xs text-base text-gray-500 dark:text-gray-400">
                    Pick a song from the search to preview it here and cast your
                    vote
                  </p>
                </div>
              ) : (
                <div className="p-8">
                  {/* Song Card */}
                  <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800/50 sm:flex-row">
                    <Image
                      src={albumImage}
                      alt={`Album cover for ${selectedSong.name}`}
                      width={120}
                      height={120}
                      className="rounded-2xl shadow-md"
                      unoptimized
                    />
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <p className="mb-1 truncate text-xl font-bold text-gray-900 dark:text-white">
                        {selectedSong.name}
                      </p>
                      <p className="truncate font-medium text-gray-500 dark:text-gray-400">
                        {artistNames}
                      </p>
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <button
                      className="bg-gold-500 hover:bg-gold-600 dark:bg-gold-500 dark:hover:bg-gold-400 shadow-gold-500/20 inline-flex items-center gap-2 rounded-xl px-10 py-4 font-bold text-white shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none dark:text-black"
                      onClick={() => handleVote("+")}
                      disabled={
                        !isUserLoggedIn || isSubmitting || isAuthLoading
                      }
                    >
                      <ThumbsUp className="h-5 w-5" />
                      Upvote
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-10 py-4 font-bold text-gray-600 transition-all hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => handleVote("-")}
                      disabled={
                        !isUserLoggedIn || isSubmitting || isAuthLoading
                      }
                    >
                      <ThumbsDown className="h-5 w-5" />
                      Downvote
                    </button>
                  </div>

                  {isSubmitting && (
                    <p className="mt-6 animate-pulse text-center text-sm font-medium text-gray-500">
                      Submitting your vote…
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Vote;
