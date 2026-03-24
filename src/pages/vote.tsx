import Image from "next/image";
import SearchForm from "./components/SearchForm";
import { useState, useEffect } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, Music } from "lucide-react";
import { useRouter } from "next/router";

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

const Vote: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";
  const userId = session?.user?.id ?? "";

  useEffect(() => {
    if (!isUserLoggedIn) return;
    const fetchRecs = async () => {
      setIsLoadingRecs(true);
      try {
        const res = await fetch("/api/getRecommendations");
        if (res.ok) {
          const data = await res.json();
          const mapped: Song[] = data.recommendations.map((r: any) => ({
            name: r.name,
            artists: [{ name: r.artist }],
            album: {
              images: [{ url: r.imageUrl || "/default-image-url" }],
            },
            id: r.id,
          }));
          setRecommendations(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch recs", e);
      } finally {
        setIsLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [isUserLoggedIn]);

  useEffect(() => {
    const { selectedSong: querySong } = router.query;
    if (typeof querySong === "string") {
      setSelectedSong(JSON.parse(querySong));
      localStorage.setItem("selectedSong", querySong);
    }
  }, [router.query]);

  const getArtistsNames = (track: Song): string => {
    return track.artists && track.artists.length > 0
      ? track.artists.map((artist) => artist.name).join(", ")
      : "Unknown Artist";
  };

  const handleSongClick = (clickedSong: Song) => {
    setSelectedSong(clickedSong);
  };

  const handleVote = async (voteType: string) => {
    if (!isUserLoggedIn) {
      toast.error("You need to be logged in to vote.");
      return;
    }

    if (!selectedSong) {
      toast.error("No song selected.");
      return;
    }

    const imageUrl =
      selectedSong.album.images[0]?.url ??
      selectedSong.album.images[1]?.url ??
      selectedSong.album.images[2]?.url ??
      "default-image-url";

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          song: selectedSong.name,
          voteType,
          artist: getArtistsNames(selectedSong),
          imageUrl,
        }),
      });

      if (response.ok) {
        toast.success("Thank you for your vote!", {
          position: "top-right",
          autoClose: 3000,
        });
        router.push("/profile");
      } else {
        toast.error("Vote failed: " + response.statusText, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Vote failed", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-black">
      <HamburgerMenu />

      <main className="flex min-h-screen flex-col items-center px-4 pb-16 pt-16">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Admin Vote
        </h1>

        {/* Search Section */}
        <div className="mb-6 w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Search Track
          </h2>
          <div className="custom-scrollbar max-h-96 overflow-y-auto">
            <SearchForm onSongClick={handleSongClick} />
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mb-6 w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Music className="h-4 w-4" /> Recommended for you
            </h2>
            <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4">
              {recommendations.map((song, idx) => {
                const img = song.album.images[0]?.url || "/default-image-url";
                const aName = getArtistsNames(song);
                return (
                  <button
                    key={(song as any).id || idx}
                    onClick={() => handleSongClick(song)}
                    className="flex w-32 flex-shrink-0 flex-col items-center gap-2 rounded-2xl border border-transparent p-2 transition-all hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-800 dark:hover:bg-gray-800"
                  >
                    <Image
                      src={img}
                      alt={song.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-xl object-cover shadow-sm transition-transform hover:scale-105"
                      unoptimized
                    />
                    <div className="w-full text-center">
                      <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                        {song.name}
                      </p>
                      <p className="truncate text-[10px] font-medium text-gray-500 dark:text-gray-400">
                        {aName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Song */}
        {selectedSong && (
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Selected Track
            </h2>

            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <Image
                src={selectedSong.album.images[0]?.url ?? "default-image-url"}
                alt={`Album cover for ${selectedSong.name}`}
                width={80}
                height={80}
                className="h-20 w-20 rounded-xl object-cover shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
                  {selectedSong.name}
                </p>
                <p className="truncate text-gray-500 dark:text-gray-400">
                  {getArtistsNames(selectedSong)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-4 font-bold text-black shadow-lg transition-transform hover:bg-gold-400 active:scale-95"
                onClick={() => handleVote("+")}
              >
                <ThumbsUp className="h-5 w-5" />
                Upvote
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-6 py-4 font-bold text-gray-700 transition-all hover:bg-gray-200 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                onClick={() => handleVote("-")}
              >
                <ThumbsDown className="h-5 w-5" />
                Downvote
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Vote;
