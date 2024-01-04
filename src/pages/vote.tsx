// pages/vote.tsx
import Link from 'next/link';
import SearchForm from './SearchForm';
import { useState } from 'react';
import HamburgerMenu from "./components/HamburgerMenu";

const Vote: React.FC = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
  const handleSongClick = (selectedSong: any) => {
    // Do something with the selected song data
    console.log('Selected Song:', selectedSong);
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
        
      </main>
    </div>
  );
};

export default Vote;
