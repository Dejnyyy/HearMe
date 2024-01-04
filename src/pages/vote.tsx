// pages/vote.tsx
import Link from 'next/link';
import SearchForm from './SearchForm';
import { useState } from 'react';
import HamburgerMenu from "./components/HamburgerMenu";

const Vote: React.FC = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);

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
      </main>
    </div>
  );
};

export default Vote;
