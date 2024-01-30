// Profile.tsx component
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import HamburgerMenu from "./components/HamburgerMenu";
import { useEffect, useState } from 'react'; 
import FaveArtist from './components/FaveArtist';
import SearchArtists from './components/SearchArtists';

const Profile: React.FC = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { selectedSong: storedSelectedSong } = router.query;
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  

  const getArtistsNames = (track: any): string => {
    if (track.artists && track.artists.length > 0) {
      return track.artists.map((artist: any) => artist.name).join(', ');
    } else {
      return 'Unknown Artist';
    }
  };

  useEffect(() => {
    // Check if there's a selectedSong in the query params
    if (storedSelectedSong) {
      // Use JSON.parse to convert the string to an object
      setSelectedSong(JSON.parse(storedSelectedSong as string));
      // Store the selectedSong data in localStorage)
      localStorage.setItem('selectedSong', storedSelectedSong as string);
    } else {
      // If there's no selectedSong in the query params, try to retrieve it from localStorage
      const localStorageSelectedSong = localStorage.getItem('selectedSong');
      if (localStorageSelectedSong) {
        setSelectedSong(JSON.parse(localStorageSelectedSong));
      }
    }
    }, [storedSelectedSong, sessionData]);
  
  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white bg-black items-center justify-center text-lg  font-mono font-semibold">
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
          
          <div className="rounded-md  py-1 text-center cursor-pointer p-10"><span>Votes: {/*votes*/}</span> - <span>First Vote</span></div>
          <div className="rounded-md  py-1 text-center cursor-pointer my-auto">Favourite Album</div>
        </div>
        <div className=" w-3/12 h-12 bg-stone-50 rounded-full my-5">
          <h1 className='text-black mt-2 text-center'>Last Vote</h1>
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
      <p className="text-center text-2xl text-white"></p>
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
