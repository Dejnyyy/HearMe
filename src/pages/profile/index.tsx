import { useRouter } from 'next/router';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import HamburgerMenu from "../components/HamburgerMenu";
import { useEffect, useState } from 'react';
import FaveArtist from '../components/FaveArtist';
import FaveAlbum from '../components/FaveAlbum';

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
  const [voteCount, setVoteCount] = useState<number>(0); // Added state variable for vote count
  const [lastVoteDetails, setLastVoteDetails] = useState<LastVoteDetails>(null);
  const [favoriteArtist, setFavoriteArtist] = useState<string | null>(null);
  const [favoriteAlbum, setFavoriteAlbum] = useState<string | null>(null);

  const handleFavoriteArtistChange = (newArtist: string) => {
    setFavoriteArtist(newArtist);
  };
  
  const handleFavoriteAlbumChange = (newAlbum: string) => {
    setFavoriteAlbum(newAlbum);
  };
  useEffect(() => {
    if (storedSelectedSong) {
      setSelectedSong(JSON.parse(storedSelectedSong as string));
      localStorage.setItem('selectedSong', storedSelectedSong as string);
    } else {
      const localStorageSelectedSong = localStorage.getItem('selectedSong');
      if (localStorageSelectedSong) {
        setSelectedSong(JSON.parse(localStorageSelectedSong));
      }
    }
    
    const fetchFirstVote = async () => {
      try {
        const response = await fetch('/api/getMyFirstVote?first=true');
        if (!response.ok) console.log('Failed to fetch the first vote');
        const vote = await response.json();
        setFirstVote(`${new Date(vote.createdAt).toLocaleDateString()}`);
      } catch (error) {
        console.error('Error fetching the first vote:', error);
      }
    };

    const fetchVotes = async () => {
      try {
        const response = await fetch('/api/getMyVotes')
        if (!response.ok) console.log('Failed to fetch votes');
        const votes = await response.json();
        setVoteCount(votes.length); // Update vote count state
        if (votes.length > 0) {
          const lastVote = votes[votes.length - 1];
          setLastVote(`${new Date(lastVote.createdAt).toLocaleDateString()}`);
        }
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };
    const fetchLastVote = async () => {
      try {
        const response = await fetch('/api/getMyLastVote?last=true');
        if (!response.ok) console.log('Failed to fetch the last vote');
        const vote = await response.json();
        setLastVoteDetails({
          date: new Date(vote.createdAt).toLocaleDateString(),
          song: vote.song,
          artist: vote.artist,
          imageUrl: vote.imageUrl ?? 'path/to/default-image.png',
        });
      } catch (error) {
        console.error('Error fetching the last vote:', error);
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

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white items-center justify-center text-lg  font-mono font-semibold"style={{ background: 'url("/cssBackground4.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <section>
          <div>
            <h1 className='text-center my-3 underline'>{sessionData?.user.name}</h1>
            <AuthShowcase />
          </div>
        </section>
        <div className="grid lg:gap-x-28 xl:gap-x-48 my-5 mx-5  grid-cols-1 lg:grid-cols-3">
          <div>
            <FaveArtist />
          </div>
          <div className="rounded-md py-1 text-center mt-2">
            <span className='bg-gray-700 px-4 py-2 rounded-lg'>Votes: {voteCount}</span>
            <br  />
            <span className='bg-gray-700 px-4 py-2 rounded-lg'>First Vote: {firstVote ?? 'No votes yet'}</span>
          </div>
          <div className="rounded-md py-1 text-center cursor-pointer my-auto">
            <div>
              <FaveAlbum />
            </div>
          </div>
        </div>
        <div className="w-3/4 sm:w-2/3 md:w-1/2 lg:w-3/12 h-12 bg-stone-50 rounded-full my-5">
          <h1 className='text-black mt-2 text-center'>Last Vote - {lastVote ?? 'No votes yet'}</h1>
        </div>

        {lastVoteDetails && (
            <div className="bg-gray-700 rounded-2xl p-3 flex items-center mb-20">
            <img
              src={lastVoteDetails.imageUrl ?? ''}
              alt={'No votes yet'}
              className="artist-image w-16 h-auto ml-2 rounded-xl"
              />
            <div className='mx-2'>
            <a href={`https://open.spotify.com/search/${encodeURIComponent(lastVoteDetails.song)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className='text-start '>
                <p className='text-start hover:underline'>{lastVoteDetails.song}</p>
            </a>  
              <span className='text-gray-400 w-auto'>{lastVoteDetails.artist}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {sessionData && 
      <div>
        <Image
          className="rounded-full w-24 h-24 border border-white"
          src={sessionData.user?.image ?? "/default-userimage.png"}
          alt={"pfp of user" + sessionData.user?.name}
          width={250}
          height={250} 
        />
      </div>
      }
    </div>
  );
}

export default Profile;