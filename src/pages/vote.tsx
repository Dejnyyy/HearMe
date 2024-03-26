// pages/vote.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchForm from './components/SearchForm';
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
  }, [router.query]);

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

  const handleVote = async (voteType: string) => {
    
    try {
      console.log('Data being sent:', {
        userId: 'clu10fgci0000ew5ho4hfij2r', // Replace with actual user ID
        song: selectedSong?.name || '',
        voteType,
        artist: getArtistsNames(selectedSong)
      });
      
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'clu10fgci0000ew5ho4hfij2r', // Replace with actual user ID
          song: selectedSong?.name || '',
          voteType,
          artist: getArtistsNames(selectedSong)
        })
      })
      

      if (response.ok) {
        const data = await response.json();
        console.log('Vote successful:', data);
        toast.success('Thank you for your vote!', {
          className: "toast-message",
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        console.error('Vote failed:', response.statusText);
        toast.error('Vote failed: ' + response.statusText, {
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
    } catch (error) {
      console.log('Vote failed:', (error as Error).message);
      toast.error('Vote failed: ' + (error as Error).message, {
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
        <div className="w-auto h-96 overflow-y-auto my-2 border rounded-lg bg-zinc-800">
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
            <div className='mx-auto'>
              <button
                className="rounded-full bg-white px-10 py-3 mx-6 font-mono font-semibold text-black no-underline transition hover:bg-white/50"
                onClick={() => handleVote('+')}
              >Vote +
              </button>
              <button
                className="rounded-full bg-white px-10 py-3 mx-6 font-mono font-semibold text-black no-underline transition hover:bg-white/50"
                onClick={() => handleVote('-')}
              >Vote -
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Vote;
