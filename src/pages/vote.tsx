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

  useEffect(() => {
    // Check if there's a selectedSong in the query params
    const { selectedSong } = router.query;
    if (selectedSong) {
      setSelectedSong(JSON.parse(selectedSong as string));
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
    // Do something with the selected song data
    console.log('Selected Song:', clickedSong);
  };

  const handleVote = () => {
    // Redirect to profile page with the selected song data as a query parameter
    
    router.push({
      pathname: '/profile',
      query: { selectedSong: JSON.stringify(selectedSong) },
    });

    // Show a thank you notification
    toast.success('Thank you for your vote!', {
      className: "toast-message",
      position: 'top-right',
      autoClose: 3000, // Close after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      
    });
  };


  return (
    <div>
      <main className="flex min-h-screen flex-col text-white items-center justify-center bg-black text-lg font-mono font-semibold">
        <HamburgerMenu />
        <Link href="/" className="absolute right-10 top-5">
          back
        </Link>
        <section>
          <div>
            <h1>Vote</h1>
          </div>
        </section>
        {/* Display search results */}
        <div className="w-auto h-96 overflow-y-auto my-2 border rounded-lg">
          <SearchForm onSongClick={handleSongClick} />
        </div>

        {/* Display selected song */}
        {selectedSong && (
          <div className="my-2 border-white border rounded-md p-4">
            <h2>Selected Song</h2>
            <img
              src={selectedSong.album.images[2]?.url || 'default-image-url'}
              alt={`Album cover for ${selectedSong.name}`}
              className='song-image'
            />
            <div>
              <strong>{selectedSong.name}</strong>
              <br />
              <span className='text-gray-400'>{getArtistsNames(selectedSong)}</span>
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
