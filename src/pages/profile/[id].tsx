import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import HamburgerMenu from "../components/HamburgerMenu";
import Image from "next/image";
import Loading from "../components/Loading";

type VoteDetails = {
  date: string;
  song: string;
  artist: string;
  imageUrl: string;
};

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState<any>(null);
  const [lastVoteDetails, setLastVoteDetails] = useState<VoteDetails | null>(
    null,
  );
  const [firstVote, setFirstVote] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${id}`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchUserVotes = async () => {
      try {
        const response = await fetch(`/api/getFirstVote?userId=${id}`);
        const votes = await response.json();
        setVoteCount(votes.length);
        if (votes.length > 0) {
          const lastVote = votes[votes.length - 1];
          setLastVoteDetails({
            date: new Date(lastVote.createdAt).toLocaleDateString(),
            song: lastVote.song,
            artist: lastVote.artist,
            imageUrl: lastVote.imageUrl ?? "path/to/default-image.png",
          });
        }
      } catch (error) {
        console.error("Error fetching user votes:", error);
      }
    };

    const fetchFirstVote = async () => {
      try {
        const response = await fetch(`/api/getFirstVote?userId=${id}`);
        if (!response.ok) throw new Error("Failed to fetch the first vote");
        const votes = await response.json();
        if (votes.length > 0) {
          setFirstVote(`${new Date(votes[0].createdAt).toLocaleDateString()}`);
        }
      } catch (error) {
        console.error("Error fetching the first vote:", error);
      }
    };

    if (id) {
      fetchUserData();
      fetchUserVotes();
      fetchFirstVote();
    }
  }, [id]);

  if (!userData) return <Loading />;

  return (
    <div>
      <HamburgerMenu />
      <main
        className="flex min-h-screen flex-col items-center justify-center font-mono text-lg font-semibold text-white"
        style={{
          background: 'url("/HearMeBG4.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <section>
          <div>
            <h1 className="my-3 text-center underline">{userData.name}</h1>
            <div>
              <Image
                className="h-24 w-24 rounded-full border border-white"
                src={userData.image ?? "/default-userimage.png"}
                alt={"pfp of user" + userData.name}
                width={1000}
                height={1000}
              />
            </div>
          </div>
        </section>
        <div className="mx-5 my-5 grid grid-cols-1 lg:grid-cols-3 lg:gap-x-28 xl:gap-x-48">
          <div>
            {userData.favoriteArtist ? (
              <div>
                <h2 className="text-center">Favourite Artist:</h2>
                <div className="flex items-center rounded-2xl bg-gray-700 p-3">
                  <img
                    src={userData.favArtImg || "default-image-url"}
                    alt={`Image for ${userData.favoriteArtist}`}
                    className="artist-image ml-2 w-16 rounded-lg "
                  />
                  <div className="ml-2 ">
                    <strong>{userData.favoriteArtist}</strong>
                  </div>
                </div>
              </div>
            ) : (
              "Favorite Artist"
            )}
          </div>
          <div className="mt-2 rounded-md py-1 text-center">
            <span className="rounded-lg bg-gray-700 px-4 py-2">
              Votes: {voteCount}
            </span>
            {firstVote && (
              <h1 className="mt-2 rounded-lg bg-gray-700 px-4 py-2 text-center">
                First Vote - {firstVote}
              </h1>
            )}
          </div>
          <div className="my-auto cursor-pointer rounded-md py-1 text-center">
            <div>
              {userData.favoriteAlbum ? (
                <div>
                  <h2 className="text-center">Favourite Album:</h2>
                  <div className="flex items-center rounded-2xl bg-gray-700 p-3">
                    <img
                      src={userData.favAlbImg || "default-image-url"}
                      alt={`Image for ${userData.favoriteAlbum}`}
                      className="album-image ml-2 w-16 rounded-lg "
                    />
                    <div className="ml-2">
                      <strong>{userData.favoriteAlbum}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                "Favorite Album"
              )}
            </div>
          </div>
        </div>
        <div className="my-5 h-12 w-3/4 rounded-full bg-stone-50 sm:w-2/3 md:w-1/2 lg:w-3/12">
          <h1 className="mt-2 text-center text-black">
            Last Vote -{" "}
            {lastVoteDetails ? lastVoteDetails.date : "No votes yet"}
          </h1>
        </div>
        {lastVoteDetails && (
          <div className="mb-20 flex items-center rounded-2xl bg-gray-700 p-3">
            <img
              src={lastVoteDetails.imageUrl}
              alt={"No voted songs yet"}
              className="artist-image ml-2 h-auto w-16 rounded-xl"
            />
            <div className="mx-2">
              <a
                href={`https://open.spotify.com/search/${encodeURIComponent(
                  lastVoteDetails.song,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-start "
              >
                <p className="text-start hover:underline">
                  {lastVoteDetails.song}
                </p>
              </a>
              <span className="w-auto text-gray-400">
                {lastVoteDetails.artist}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;
