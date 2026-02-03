import { useRouter } from "next/router";
import Image from "next/image";
import SearchForm from "./components/SearchForm";
import { useState, useEffect } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

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
  const router = useRouter();
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";
  const userId = session?.user?.id ?? "";

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

    const imageUrl = selectedSong.album.images[2]?.url ?? "default-image-url";

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
          <div className="max-h-96 overflow-y-auto">
            <SearchForm onSongClick={handleSongClick} />
          </div>
        </div>

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
                className="bg-gold-500 hover:bg-gold-400 flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-black shadow-lg transition-transform active:scale-95"
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
