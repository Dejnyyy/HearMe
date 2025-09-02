import { useRouter } from "next/router";
import Image from "next/image";
import { useSession } from "next-auth/react";
import HamburgerMenu from "../components/HamburgerMenu";
import { useEffect, useState } from "react";
import FaveArtist from "../components/FaveArtist";
import FaveAlbum from "../components/FaveAlbum";
import ProfileCircularLoading from "../components/ProfileCircularloading";

type LastVoteDetails = {
  date: Date | string;
  song: string;
  artist: string;
  imageUrl: string | null;
} | null;

const Profile: React.FC = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { selectedSong: storedSelectedSong } = router.query;
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [lastVote, setLastVote] = useState<string | null>(null);
  const [firstVote, setFirstVote] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [lastVoteDetails, setLastVoteDetails] = useState<LastVoteDetails>(null);
  const [favoriteArtist, setFavoriteArtist] = useState<string | null>(null);
  const [favoriteAlbum, setFavoriteAlbum] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [scrollUpProgress, setScrollUpProgress] = useState(0);

  const handleFavoriteArtistChange = (newArtist: string) => {
    setFavoriteArtist(newArtist);
  };

  const handleFavoriteAlbumChange = (newAlbum: string) => {
    setFavoriteAlbum(newAlbum);
  };

  useEffect(() => {
    if (storedSelectedSong) {
      setSelectedSong(JSON.parse(storedSelectedSong as string));
      localStorage.setItem("selectedSong", storedSelectedSong as string);
    } else {
      const localStorageSelectedSong = localStorage.getItem("selectedSong");
      if (localStorageSelectedSong) {
        setSelectedSong(JSON.parse(localStorageSelectedSong));
      }
    }

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
          imageUrl: vote.imageUrl ?? "path/to/default-image.png",
        });
      } catch (error) {
        console.error("Error fetching the last vote:", error);
      }
    };

    if (sessionData) {
      fetchFirstVote();
      fetchLastVote();
      console.log("firstVote:", firstVote);
      console.log("lastVote:", lastVote);
    }
    void fetchVotes();
  }, [storedSelectedSong, sessionData]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;

      setScrollProgress(scrolled);

      if (scrollTop < lastScrollTop) {
        // Scroll up detected
        setScrollUpProgress((prev) => {
          const newProgress = prev + 3;
          if (newProgress >= 100) {
            router.push("/");
          }
          return newProgress;
        });
      } else {
        setScrollUpProgress(0);
      }

      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop); // For mobile or negative scrolling
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop, router]);

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
            <h1 className="my-3 text-center underline">
              {sessionData?.user.name}
            </h1>
            <AuthShowcase />
          </div>
        </section>
        <div className="mx-5 my-5 grid grid-cols-1 lg:grid-cols-3 lg:gap-x-28 xl:gap-x-48">
          <div>
            <FaveArtist />
          </div>
          <div className="mt-2 rounded-md py-1 text-center">
            <span className="rounded-lg bg-gray-700 px-4 py-2">
              Votes: {voteCount}
            </span>
            <br />
            <span className="rounded-lg bg-gray-700 px-4 py-2">
              First Vote: {firstVote ?? "No votes yet"}
            </span>
          </div>
          <div className="my-auto cursor-pointer rounded-md py-1 text-center">
            <div>
              <FaveAlbum />
            </div>
          </div>
        </div>
        <div className="my-5 h-12 w-3/4 rounded-full bg-stone-50 sm:w-2/3 md:w-1/2 lg:w-3/12">
          <h1 className="mt-2 text-center text-black">
            Last Vote - {lastVote ?? "No votes yet"}
          </h1>
        </div>

        {lastVoteDetails && (
          <div className="mb-20 flex items-center rounded-2xl bg-gray-700 p-3">
            <img
              src={lastVoteDetails.imageUrl ?? ""}
              alt={"No votes yet"}
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
        {/* Artificially adding height to enable scrolling */}
        <div style={{ height: "30vh" }}></div>
      </main>
      <ProfileCircularLoading progress={scrollUpProgress} />
    </div>
  );
};

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {sessionData && (
        <div>
          <Image
            className="h-24 w-24 rounded-full border border-white"
            src={sessionData.user?.image ?? "/default-userimage.png"}
            alt={"pfp of user" + sessionData.user?.name}
            width={1000}
            height={1000}
          />
        </div>
      )}
    </div>
  );
}

export default Profile;
