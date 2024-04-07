import { useRouter } from 'next/router';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import HamburgerMenu from "./components/HamburgerMenu";
import { useEffect, useState } from 'react';
import FaveArtist from './components/FaveArtist';
import FaveAlbum from './components/FaveAlbum';

const Profile: React.FC = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { selectedSong: storedSelectedSong } = router.query;
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [lastVote, setLastVote] = useState<string | null>(null);
  const [favoriteArtist, setFavoriteArtist] = useState<string | null>(null);
  const [favoriteAlbum, setFavoriteAlbum] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState<number>(0); // Added state variable for vote count

  const handleFavoriteArtistChange = (newArtist: string) => {
    setFavoriteArtist(newArtist);
    updateFavorites(newArtist, favoriteAlbum);
  };
  
  const handleFavoriteAlbumChange = (newAlbum: string) => {
    setFavoriteAlbum(newAlbum);
    updateFavorites(favoriteArtist, newAlbum);
  };
  
  const getArtistsNames = (track: any): string => {
    if (track.artists && track.artists.length > 0) {
      return track.artists.map((artist: any) => artist.name).join(', ');
    } else {
      return 'Unknown Artist';
    }
  };

  const updateFavorites = async (favoriteArtist: string, favoriteAlbum: string) => {
    if (!sessionData) {
      console.log('User must be logged in to update favorites');
      return;
    }
  
    try {
      const response = await fetch('/api/updateFavorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: sessionData.user.id,
          favoriteArtist,
          favoriteAlbum,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update favorites');
      }
  
      const data = await response.json();
      console.log('Favorites updated:', data);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
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

    const fetchVotes = async () => {
      try {
        const response = await fetch('/api/getMyVotes');
        if (!response.ok) throw new Error('Failed to fetch votes');
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

    fetchVotes();
  }, [storedSelectedSong, sessionData]);

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white bg-gray-950 items-center justify-center text-lg  font-mono font-semibold">
        <section>
          <div>
            <h1 className='text-center my-3 underline'>{sessionData?.user.name}</h1>
            <AuthShowcase />
          </div>
        </section>
        <div className="grid gap-x-60 my-5 mx-5 grid-cols-3">
          <div>
            <FaveArtist />
          </div>
          <div className="rounded-md py-1 text-center cursor-pointer p-10">
            <span>Votes: {voteCount}</span> - <span>First Vote</span>
          </div>
          <div className="rounded-md py-1 text-center cursor-pointer my-auto">
            <div>
              <FaveAlbum />
            </div>
          </div>
        </div>
        <div className="w-3/12 h-12 bg-stone-50 rounded-full my-5">
          <h1 className='text-black mt-2 text-center'>Last Vote - {lastVote || 'No votes yet'}</h1>
        </div>

        {selectedSong && (
          <div className="my-2 border-white border rounded-md p-4 flex items-center">
            <img
              src={selectedSong.album.images[2]?.url || 'default-image-url'}
              alt={`Album cover for ${selectedSong.name}`}
              className='song-image mb-1'
            />
            <div className='mx-2'>
              <strong className='w-auto'>{selectedSong.name}</strong>
              <br />
              <span className='text-gray-400 w-auto'>{getArtistsNames(selectedSong)}</span>
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
          className="rounded-full w-24 h-24 shadow-white shadow-md"
          src={sessionData.user?.image ?? ""}
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
