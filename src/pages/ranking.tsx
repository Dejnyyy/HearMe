import React, { useState, useEffect } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Loading from "./components/Loading";
import { Globe2, Users, Trophy, Trash2 } from "lucide-react";

interface Vote {
  id: number;
  createdAt: string;
  song: string;
  artist: string;
  voteType: string;
  imageUrl?: string;
  userId: string;
  name?: string;
  image?: string;
}

interface VoteWithCount extends Vote {
  voteCount: number;
}

const Ranking: React.FC = () => {
  const { data: sessionData } = useSession();
  const [votes, setVotes] = useState<VoteWithCount[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [shownType, setShownType] = useState(true);
  const [loading, setLoading] = useState(true);
  const isAdmin = sessionData?.user?.isAdmin;

  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true);
      const apiEndpoint = shownType
        ? "/api/getVotesVoteCount"
        : "/api/findMineAndFriendsVotes";
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          console.log("Votes fetch failed");
          setLoading(false);
          return;
        }
        const votesData: VoteWithCount[] = await response.json();
        const votesWithUserDetails = await Promise.all(
          votesData.map(async (vote: VoteWithCount) => ({
            ...vote,
            ...(await fetchUserDetails(vote.userId)),
          })),
        );
        setVotes(votesWithUserDetails);
      } catch (error) {
        console.error("Error fetching votes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes().catch((error: Error) => {
      console.error("Failed to fetch votes:", error);
      setLoading(false);
    });
  }, [shownType]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/getUserByUserId?userId=${userId}`);
      if (!res.ok) {
        console.log("User fetch failed");
        return { name: "Unknown", image: "/default-profile.png" };
      }
      const userData = await res.json();
      return { name: userData.name, image: userData.image };
    } catch (error) {
      console.error("fetchUserDetails error:", error);
      return { name: "Unknown", image: "/default-profile.png" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("cz-CS", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", ", ");
  };

  const toggleTypeShown = () => setShownType(!shownType);
  const toggleExpanded = (index: number) =>
    setExpandedIndex(expandedIndex === index ? null : index);

  const feedType = shownType ? "World" : "Friends";

  const handleDeleteClick = async (voteId: number) => {
    try {
      const response = await fetch(`/api/deleteVote?voteId=${voteId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Failed to delete vote");
        return;
      }
      setVotes((prevVotes) => prevVotes.filter((vote) => vote.id !== voteId));
    } catch (error) {
      console.error("Error deleting vote:", error);
    }
  };

  const sortedVotes = [...votes].sort((a, b) => b.voteCount - a.voteCount);
  const topVotes = sortedVotes.slice(0, 3);
  const remainingVotes = sortedVotes.slice(3);

  const getRankBorder = (index: number) => {
    switch (index) {
      case 0:
        return "border-gold-500";
      case 1:
        return "border-gray-400";
      case 2:
        return "border-amber-700";
      default:
        return "border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />

      <main className="px-4 pb-16 pt-8 text-white">
        {/* Header */}
        <div className="mx-auto mb-8 flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-white">Ranking</h1>
            <p className="text-gray-500">All-time leaderboard</p>
          </div>
          <button
            onClick={toggleTypeShown}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-sm transition-colors hover:bg-gray-800"
          >
            {shownType ? (
              <Globe2 className="h-4 w-4" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            Showing: {feedType}
          </button>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <Loading />
          ) : votes.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
              <p className="text-lg text-gray-400">No votes yet.</p>
            </div>
          ) : (
            <>
              {/* Top 3 */}
              <h2 className="mb-4 text-center text-xl text-gray-400">Top 3:</h2>
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                {topVotes.map((vote, index) => (
                  <article
                    key={index}
                    className={`rounded-2xl border-2 ${getRankBorder(
                      index,
                    )} bg-gray-900 p-4`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="bg-gold-500 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-black">
                        <Trophy className="h-4 w-4" />#{index + 1}
                      </div>
                      <div className="text-sm text-gray-400">
                        Votes:{" "}
                        <span className="text-gold-400 font-bold">
                          {vote.voteCount}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                      <Image
                        src={vote.image || "/default-userimage.png"}
                        alt="Profile Picture"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                      />
                      <p className="text-gray-300">{vote.name}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <img
                        src={vote.imageUrl || "/favicon.png"}
                        alt={`Cover for ${vote.song}`}
                        className="mb-3 h-32 w-32 rounded-lg object-cover"
                      />
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          vote.song,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center font-medium text-white hover:underline"
                      >
                        {vote.song}
                      </a>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          vote.artist,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:underline"
                      >
                        {vote.artist}
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              {/* All Other Votes */}
              <h2 className="mb-4 text-center text-xl text-gray-400">
                All Other Votes:
              </h2>
              <div className="max-h-[50vh] space-y-3 overflow-y-auto">
                {remainingVotes.map((vote, index) => (
                  <article
                    key={index}
                    className="cursor-pointer rounded-2xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
                    onClick={() => toggleExpanded(index)}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={vote.image || "/default-userimage.png"}
                        alt="Profile Picture"
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full"
                      />
                      <p className="text-gray-300">{vote.name}</p>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          Votes:{" "}
                          <span className="text-gold-400 font-bold">
                            {vote.voteCount}
                          </span>
                        </span>
                        {isAdmin && (
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border border-red-800/50 bg-red-900/30 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-900/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(vote.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <img
                        src={vote.imageUrl || "/favicon.png"}
                        alt={`Cover for ${vote.song}`}
                        className="mx-auto h-20 w-20 rounded-lg object-cover sm:mx-0"
                      />
                      <div className="text-center sm:text-left">
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(
                            vote.song,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-white hover:underline"
                        >
                          {vote.song}
                        </a>
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(
                            vote.artist,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-gray-500 hover:underline"
                        >
                          {vote.artist}
                        </a>
                      </div>
                    </div>

                    {expandedIndex === index && (
                      <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-800 pt-3">
                        <span
                          className={`rounded-lg px-2 py-1 text-xs ${
                            vote.voteType === "+"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {vote.voteType === "+" ? "Upvote" : "Downvote"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(vote.createdAt)}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Ranking;
