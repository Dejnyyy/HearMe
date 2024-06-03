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

const VoteToday: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [lastVoteDate, setLastVoteDate] = useState<Date | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isUserLoggedIn = status === "authenticated";
  const userId = session?.user?.id ?? '';

  useEffect(() => {
    const { selectedSong: querySong } = router.query;
    if (typeof querySong === 'string') {
      setSelectedSong(JSON.parse(querySong));
      localStorage.setItem('selectedSong', querySong);
    }
  }, [router.query]);

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchLastVoteDate();
    }
  }, [isUserLoggedIn]);

  const fetchLastVoteDate = async () => {
    try {
      const response = await fetch(`/api/voteToday?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastVoteDate) {
          setLastVoteDate(new Date(data.lastVoteDate));
        }
      }
    } catch (error) {
      console.error('Failed to fetch last vote date:', error);
    }
  };

  const canVote = (): boolean => {
    if (!lastVoteDate) return true;
    const now = new Date();
    return now.getDate() !== lastVoteDate.getDate() || now.getMonth() !== lastVoteDate.getMonth() || now.getFullYear() !== lastVoteDate.getFullYear();
  };

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
        toast.error('You need to log in to vote',{
            className: "toast-message",
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      return;
    }

    if (!selectedSong) {
        toast.error('No song selected',{
            className: "toast-message",
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      return;
    }

    if (!canVote()) {
      toast.error('You can only vote once per day.',{
        className: "toast-message",
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const imageUrl = selectedSong.album.images[2]?.url ?? 'default-image-url';

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          song: selectedSong.name,
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
        setLastVoteDate(new Date());
        router.push('/profile');
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
      toast.error('Vote failed', {
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
      <main className="flex min-h-screen flex-col text-white items-center justify-center text-lg font-mono font-semibold" style={{ background: 'url("/cssBackground4.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <HamburgerMenu />
        <section>
          <div>
            <h1>Vote</h1>
          </div>
        </section>
        <div className="w-5/6 sm:w-2/3 md:w-1/2 lg:w-1/2 xl:w-1/3 h-96 overflow-y-auto my-2 rounded-xl shadow-lg bg-zinc-800">
          <SearchForm onSongClick={handleSongClick} />
        </div>
        {selectedSong && (
          <div className="my-2 rounded-md p-4">
            <h2>Selected Song</h2>
            <div className="my-2 p-4 rounded-xl bg-zinc-800 flex items-center">
              <Image
                src={selectedSong.album.images[2]?.url ?? 'default-image-url'}
                alt={`Album cover for ${selectedSong.name}`}
                width={70}
                height={70}
                className='song-image mb-1 rounded-lg'
              />
              <div className='mx-2'>
                <strong>{selectedSong.name}</strong>
                <br />
                <span className='text-gray-400'>{getArtistsNames(selectedSong)}</span>
              </div>
            </div>
            <div className='mx-auto text-center'>
              <button
                className="rounded-full  px-10 py-3 mx-auto mr-4 bg-green-500 font-mono font-semibold text-black no-underline transition hover:bg-green-700"
                onClick={() => handleVote('+')}
              >Vote
              </button>
              <button
                className="rounded-full bg-red-500 px-10 py-3 mx-auto ml-4 font-mono font-semibold text-black no-underline transition hover:bg-red-700"
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

export default VoteToday;
