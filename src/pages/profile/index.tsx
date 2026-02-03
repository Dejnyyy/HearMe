import { useRouter } from "next/router";
import Image from "next/image";
import { useSession } from "next-auth/react";
import HamburgerMenu from "../components/HamburgerMenu";
import { useEffect, useState } from "react";
import FaveArtist from "../components/FaveArtist";
import FaveAlbum from "../components/FaveAlbum";
import { Music, Calendar, Zap } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-black">
      <HamburgerMenu />

      <main className="flex min-h-screen flex-col items-center px-4 py-8 text-gray-900 dark:text-white">
        {/* Profile Header */}
        <div className="mt-8 flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative mb-4">
            <div className="dark:ring-gold-500/50 h-28 w-28 overflow-hidden rounded-full bg-white p-1 shadow-xl ring-2 ring-gray-200 dark:bg-gray-900">
              <div className="h-full w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
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
                  <div className="dark:bg-gold-500 flex h-full w-full items-center justify-center bg-gray-200 text-3xl font-bold text-gray-500 dark:text-black">
                    {sessionData?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Username */}
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {sessionData?.user?.name ?? "User"}
          </h1>
        </div>

        {/* Stats Row */}
        <div className="mb-10 grid w-full max-w-2xl grid-cols-3 gap-3 sm:gap-6">
          <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <Zap className="text-gold-500 mb-2 h-5 w-5" />
            <p className="dark:text-gold-400 text-2xl font-bold text-gray-900">
              {voteCount}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Votes
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <Calendar className="mb-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {firstVote ?? "—"}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              First
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <Music className="mb-2 h-5 w-5 text-purple-500 dark:text-purple-400" />
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {lastVote ?? "—"}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Last
            </p>
          </div>
        </div>

        {/* Latest Vote Card */}
        {lastVoteDetails && (
          <div className="mb-10 w-full max-w-md">
            <h2 className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
              Latest Track
            </h2>
            <a
              href={`https://open.spotify.com/search/${encodeURIComponent(
                lastVoteDetails.song,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:border-gold-400/30 group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
            >
              {lastVoteDetails.imageUrl ? (
                <img
                  src={lastVoteDetails.imageUrl}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <Music className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="group-hover:text-gold-600 dark:group-hover:text-gold-400 truncate font-bold text-gray-900 transition-colors dark:text-white">
                  {lastVoteDetails.song}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {lastVoteDetails.artist}
                </p>
              </div>
            </a>
          </div>
        )}

        {/* Favorites Section */}
        <div className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
            Favorites
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Favourite Artist
              </h3>
              <FaveArtist />
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Favourite Album
              </h3>
              <FaveAlbum />
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-24" />
      </main>
    </div>
  );
};

export default Profile;
