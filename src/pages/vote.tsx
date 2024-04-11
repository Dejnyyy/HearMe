import { useRouter } from 'next/router';
import Image from 'next/image';
import SearchForm from './components/SearchForm';
import { useState, useEffect } from 'react';
import HamburgerMenu from "./components/HamburgerMenu";
import { toast } from 'react-toastify';
import { useSession } from "next-auth/react";

interface Artist {
  name: string;
}

interface Image {
  url: string;
}

interface Album {
  images: Image[];
}

interface Song {
  name: string;
  artists: Artist[];
  album: Album;
}

const Vote: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";
  const userId = session?.user?.id ?? ''; // Use nullish coalescing operator

  useEffect(() => {
    const { selectedSong: querySong } = router.query;
    if (typeof querySong === 'string') {
      setSelectedSong(JSON.parse(querySong));
      localStorage.setItem('selectedSong', querySong);
    }
  }, [router.query]);

  const getArtistsNames = (track: Song): string => {
    return track.artists && track.artists.length > 0
      ? track.artists.map((artist) => artist.name).join(', ')
      : 'Unknown Artist';
  };

  const handleSongClick = (clickedSong: Song) => {
    setSelectedSong(clickedSong);
    console.log('Selected Song:', clickedSong);
  };

  const handleVote = async (voteType: string) => {
    if (!isUserLoggedIn) {
      toast.error('You need to be logged in to vote.');
      return;
    }
  
    if (!selectedSong) {
      toast.error('No song selected.');
      return;
    }
  
    const imageUrl = selectedSong.album.images[2]?.url ?? 'default-image-url';
  
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          song: selectedSong.name, // It's safe to directly access since we check for null above
          voteType,
          artist: getArtistsNames(selectedSong), // Now always a Song object
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
        <div className="w-5/6 sm:w-2/3 lg:w-1/2 xl:w-1/4 h-96 overflow-y-auto my-2 rounded-xl shadow-lg bg-zinc-800">
          <SearchForm onSongClick={handleSongClick} />
        </div>
        {selectedSong && (
          <div className="my-2 rounded-md p-4">
            <h2>Selected Song</h2>
            <div className="my-2 p-4 rounded-xl bg-zinc-800 flex items-center">
              <Image
                src={selectedSong.album.images[2]?.url ?? 'default-image-url'}
                alt={`Album cover for ${selectedSong.name}`}
                width={50} // Specify width
                height={50} // Specify height
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
                className="rounded-full  px-10 py-3 mx-6 bg-yellow-500 font-mono font-semibold text-black no-underline transition hover:bg-yellow-700"
                onClick={() => handleVote('+')}
              >Vote
              </button>
              <button
                className="rounded-full bg-red-500 px-10 py-3 mx-6 font-mono font-semibold text-black no-underline transition hover:bg-red-700"
                onClick={() => handleVote('-')}
              >Vote
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Vote;
