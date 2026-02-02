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
    <div className="min-h-screen bg-black">
      <HamburgerMenu />

      <main className="flex min-h-screen flex-col items-center px-4 pb-16 pt-16 text-white">
        <h1 className="mb-8 text-3xl font-bold">Vote</h1>

        {/* Search Section */}
        <div className="mb-6 w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
            Search Track
          </h2>
          <div className="max-h-80 overflow-y-auto">
            <SearchForm onSongClick={handleSongClick} />
          </div>
        </div>

        {/* Selected Song */}
        {selectedSong && (
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
              Selected Track
            </h2>

            <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-700 bg-gray-800 p-4">
              <Image
                src={selectedSong.album.images[2]?.url ?? "default-image-url"}
                alt={`Album cover for ${selectedSong.name}`}
                width={64}
                height={64}
                className="rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">
                  {selectedSong.name}
                </p>
                <p className="truncate text-gray-500">
                  {getArtistsNames(selectedSong)}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                className="bg-gold-500 hover:bg-gold-400 inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold text-black transition"
                onClick={() => handleVote("+")}
              >
                <ThumbsUp className="h-5 w-5" />
                Upvote
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-gray-700 px-8 py-3 font-semibold text-white transition hover:bg-gray-600"
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
