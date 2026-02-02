import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import SearchForm from "./components/SearchForm";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";

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
    <div className="min-h-screen bg-black">
      <HamburgerMenu />

      <main className="px-4 pb-16 pt-8">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold text-white">Vote</h1>
          <p className="text-gray-500">
            Search and vote for your song of the day
          </p>
          {!isUserLoggedIn && !isAuthLoading && (
            <div className="bg-gold-500/10 border-gold-500/20 mt-4 rounded-xl border px-4 py-3">
              <p className="text-gold-400 text-sm">
                Log in to submit your vote
              </p>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Search */}
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="border-b border-gray-800 px-5 py-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Search Track
              </h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto p-5">
              <SearchForm onSongClick={handleSongClick} />
            </div>
          </div>

          {/* Right: Selected */}
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Selected Track
              </h2>
              {selectedSong && (
                <button
                  onClick={clearSelection}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-700"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            {!selectedSong ? (
              <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-700 bg-gray-800">
                  <span className="text-3xl">🎵</span>
                </div>
                <p className="max-w-xs text-sm text-gray-500">
                  Pick a song from the search to preview it here and cast your
                  vote
                </p>
              </div>
            ) : (
              <div className="p-5">
                {/* Song Card */}
                <div className="flex items-center gap-4 rounded-xl border border-gray-700 bg-gray-800 p-4">
                  <Image
                    src={albumImage}
                    alt={`Album cover for ${selectedSong.name}`}
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-white">
                      {selectedSong.name}
                    </p>
                    <p className="truncate text-gray-500">{artistNames}</p>
                  </div>
                </div>

                {/* Vote Buttons */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <button
                    className="bg-gold-500 hover:bg-gold-400 inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleVote("+")}
                    disabled={!isUserLoggedIn || isSubmitting || isAuthLoading}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    Upvote
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-700 px-8 py-3 font-semibold text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleVote("-")}
                    disabled={!isUserLoggedIn || isSubmitting || isAuthLoading}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    Downvote
                  </button>
                </div>

                {isSubmitting && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Submitting your vote…
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Vote;
