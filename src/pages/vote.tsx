// pages/vote.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchForm from './SearchForm';
import { useState, useEffect } from 'react';
import HamburgerMenu from "./components/HamburgerMenu";
import { toast } from 'react-toastify';

const Vote: React.FC = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const router = useRouter();

  const storageKey = 'lastVotedDate';

  useEffect(() => {
    // check if there is a selectedSong in the query params
    const { selectedSong } = router.query;
    if (selectedSong) {
      setSelectedSong(JSON.parse(selectedSong as string));
         // store the song in localStorage
         localStorage.setItem('selectedSong', selectedSong as string);
    }

    const lastVotedDate = localStorage.getItem(storageKey);
    const currentDate = new Date().toLocaleDateString();

    if (lastVotedDate === currentDate) {
      // user has already voted today, disable voting
      setSelectedSong(null);
    }
  }, [router.query]);

  const handleSearch = (results: any[]) => {
    setSearchResults(results);
  };

  const getArtistsNames = (track: any): string => {
    if (track.artists && track.artists.length > 0) {
      return track.artists.map((artist: any) => artist.name).join(', ');
    } else {
      return 'Unknown Artist';
    }
  };

  const handleSongClick = (clickedSong: any) => {
    setSelectedSong(clickedSong);
    // the selected song data
    console.log('Selected Song:', clickedSong);
  };

  const handleVote = () => {
    // check if the user voted today
    const lastVotedDate = localStorage.getItem(storageKey);
    const currentDate = new Date().toLocaleDateString();
    // user can vote today
    if (lastVotedDate !== currentDate) {
      
      // update the last voted date in localStorage
      localStorage.setItem(storageKey, currentDate);
      // store the selected song in localStorage
      localStorage.setItem('selectedSong', JSON.stringify(selectedSong));

      // go to profile page with the selected song data as a query parameter
      router.push({
        pathname: '/profile',
        query: { selectedSong: JSON.stringify(selectedSong) },
      });

      // update last vote date in localStorage
      localStorage.setItem(storageKey, currentDate);

      toast.success('Thank you for your vote!', {
        className: "toast-message",
        position: 'top-right',
        autoClose: 3000, // 3s
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      // user has already voted today
      toast.error('You can only vote once a day.', {
        className: "toast-message",
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div>
      <main className="flex min-h-screen flex-col text-white items-center justify-center bg-black text-lg font-mono font-semibold">
        <HamburgerMenu />
        <section>
          <div>
            <h1>Vote</h1>
          </div>
        </section>
       
        <div className="w-auto h-96 overflow-y-auto my-2 border rounded-lg bg-zinc-900">
          <SearchForm onSongClick={handleSongClick} />
        </div>
        {selectedSong && (
          <div className="my-2 rounded-md p-4">
            <h2>Selected Song</h2>
            <div className="my-2 p-4 border-white border rounded-md flex items-center">
            <img
              src={selectedSong.album.images[2]?.url || 'default-image-url'}
              alt={`Album cover for ${selectedSong.name}`}
              className='song-image mb-1'
            />
            <div className='mx-2'>
              <strong>{selectedSong.name}</strong>
              <br />
              <span className='text-gray-400'>{getArtistsNames(selectedSong)}</span>
            </div>
            </div>
            
          </div>
        )}

        <button
          className="rounded-full bg-white px-10 py-3 font-mono font-semibold   text-black no-underline transition hover:bg-white/50"
          onClick={handleVote}
          disabled={!selectedSong} 
        >
          Vote
        </button>
      </main>
    </div>
  );
};

export default Vote;
