import { useRouter } from "next/router";
import Image from "next/image";
import { useSession } from "next-auth/react";
import HamburgerMenu from "../components/HamburgerMenu";
import { useEffect, useState } from "react";
import FaveArtist from "../components/FaveArtist";
import FaveAlbum from "../components/FaveAlbum";

type LastVoteDetails = {
  date: Date | string;
  song: string;
  artist: string;
  imageUrl: string | null;
} | null;

const Profile: React.FC = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [lastVote, setLastVote] = useState<string | null>(null);
  const [firstVote, setFirstVote] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [lastVoteDetails, setLastVoteDetails] = useState<LastVoteDetails>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchFirstVote = async () => {
      try {
        const response = await fetch("/api/getMyFirstVote?first=true");
        if (!response.ok) console.log("Failed to fetch the first vote");
        const vote = await response.json();
        setFirstVote(`${new Date(vote.createdAt).toLocaleDateString()}`);
      } catch (error) {
        console.error("Error fetching the first vote:", error);
      }
    };

    const fetchVotes = async () => {
      try {
        const response = await fetch("/api/getMyVotes");
        if (!response.ok) console.log("Failed to fetch votes");
        const votes = await response.json();
        setVoteCount(votes.length);
        if (votes.length > 0) {
          const lastVote = votes[votes.length - 1];
          setLastVote(`${new Date(lastVote.createdAt).toLocaleDateString()}`);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    const fetchLastVote = async () => {
      try {
        const response = await fetch("/api/getMyLastVote?last=true");
        if (!response.ok) console.log("Failed to fetch the last vote");
        const vote = await response.json();
        setLastVoteDetails({
          date: new Date(vote.createdAt).toLocaleDateString(),
          song: vote.song,
          artist: vote.artist,
          imageUrl: vote.imageUrl ?? null,
        });
      } catch (error) {
        console.error("Error fetching the last vote:", error);
      }
    };

    if (sessionData) {
      fetchFirstVote();
      fetchLastVote();
    }
    void fetchVotes();
  }, [sessionData]);

  const profileImage = sessionData?.user?.image;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <HamburgerMenu />

      <main className="flex min-h-screen flex-col items-center px-4 py-8 font-sans text-white">
        {/* Profile Header */}
        <div className="mt-8 flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative mb-4">
            <div className="h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-400 p-1">
              <div className="h-full w-full overflow-hidden rounded-full bg-gray-900">
                {profileImage && !imageError ? (
                  <Image
                    src={profileImage}
                    alt=""
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 text-3xl font-bold">
                    {sessionData?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Username */}
          <h1 className="mb-6 text-2xl font-bold tracking-wide">
            {sessionData?.user?.name ?? "User"}
          </h1>
        </div>

        {/* Stats Row */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center backdrop-blur-sm">
            <p className="bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-3xl font-bold text-transparent">
              {voteCount}
            </p>
            <p className="text-sm text-gray-400">Total Votes</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center backdrop-blur-sm">
            <p className="text-lg font-semibold text-white">
              {firstVote ?? "—"}
            </p>
            <p className="text-sm text-gray-400">First Vote</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center backdrop-blur-sm">
            <p className="text-lg font-semibold text-white">
              {lastVote ?? "—"}
            </p>
            <p className="text-sm text-gray-400">Last Vote</p>
          </div>
        </div>

        {/* Latest Vote Card */}
        {lastVoteDetails && (
          <div className="mb-8 w-full max-w-md">
            <h2 className="mb-3 text-center text-sm font-medium uppercase tracking-wider text-gray-400">
              Latest Vote
            </h2>
            <a
              href={`https://open.spotify.com/search/${encodeURIComponent(
                lastVoteDetails.song,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/10"
            >
              {lastVoteDetails.imageUrl ? (
                <img
                  src={lastVoteDetails.imageUrl}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-700">
                  <span className="text-2xl">🎵</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">
                  {lastVoteDetails.song}
                </p>
                <p className="truncate text-sm text-gray-400">
                  {lastVoteDetails.artist}
                </p>
              </div>
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Favorites Section */}
        <div className="w-full max-w-4xl">
          <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-gray-400">
            Favorites
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Favourite Artist
              </h3>
              <FaveArtist />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Favourite Album
              </h3>
              <FaveAlbum />
            </div>
          </div>
        </div>

        {/* Spacer for scrolling */}
        <div className="h-24" />
      </main>
    </div>
  );
};

export default Profile;
