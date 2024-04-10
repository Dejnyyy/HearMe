 // pages/vote.tsx
import { useRouter } from 'next/router';
import SearchForm from './components/SearchForm';
import { useState, useEffect } from 'react';
import HamburgerMenu from "./components/HamburgerMenu";
import { toast } from 'react-toastify';
import { useSession } from "next-auth/react"; // Import useSession

const Vote: React.FC = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession(); // Use the useSession hook to get session data
  const isUserLoggedIn = status === "authenticated"; // Check if the user is logged in
  const userId = session?.user?.id || ''; // Directly use userId from session

  useEffect(() => {
    const { selectedSong } = router.query;
    if (selectedSong) {
      setSelectedSong(JSON.parse(selectedSong as string));
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
    console.log('Selected Song:', clickedSong);
  };

  const handleVote = async (voteType: string) => {
    if (!isUserLoggedIn) {
      toast.error('You need to be logged in to vote.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const imageUrl = selectedSong.album.images[2]?.url || 'default-image-url';
  
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          song: selectedSong?.name || '',
          voteType,
          artist: getArtistsNames(selectedSong),
          imageUrl,
        }),
      });
  
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
      console.log('Vote failed:', (error as Error));
      toast.error('Vote failed: ' + (error as Error), {
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
      <main className="flex min-h-screen flex-col text-white items-center justify-center bg-gray-950 text-lg font-mono font-semibold">
        <HamburgerMenu />
        <section>
          <div>
            <h1>Vote</h1>
          </div>
        </section>
        <div className=" w-5/6 sm:w-2/3 lg:w-1/2 xl:w-1/4 h-96 overflow-y-auto my-2 rounded-xl shadow-lg bg-zinc-800" >
          <SearchForm onSongClick={handleSongClick} />
        </div>
        {selectedSong && (
          <div className="my-2 rounded-md p-4">
            <h2>Selected Song</h2>
            <div className="my-2 p-4  rounded-xl bg-zinc-800 flex items-center">
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
