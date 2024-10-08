import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { searchSpotifySongs, getAccessToken } from '../../utils/spotifyApi';

interface SearchFormProps {
  onSongClick: (selectedSong: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSongClick }) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState<any>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);

  const getArtistsNames = (track: any): string => {
    if (track.artists && track.artists.length > 0) {
      return track.artists.map((artist: any) => artist.name).join(', ');
    } else {
      return 'Unknown Artist';
    }
  };

  const handleSearch = async () => {
    try {
      if (searchQuery.length > 1){
      console.log(session?.user);
      let accessToken = await getAccessToken( );
      console.log("Query: ", searchQuery);
         if (accessToken) {
          const result = await searchSpotifySongs(searchQuery, accessToken);
          setSearchResults(result.tracks.items);
         }else {
          console.log("no access token");
         }
      } else {
        console.log("too short search query");
      }
    }  catch (error) {
      console.log(error);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSongClick = (clickedSong: any) => {
    setSelectedSong(clickedSong);
    onSongClick(clickedSong);
    
  };

  return (
    <div className="font-mono font-semibold">
      <input
        className="rounded-md text-black py-1 m-3 pl-2 w-2/3"
        type="text"
        placeholder='Search a song'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className='m-auto mr-4' onClick={handleSearch}>Search</button>

      {searchResults.map((song) => (
        <li
          className='list-none px-2 py-2 flex items-center m-2 cursor-pointer rounded-lg hover:bg-gray-500'
          key={song.id}
          onClick={() => handleSongClick(song)}
        >
          <img
            src={song.album.images[2]?.url || 'default-image-url'}
            alt={`Album cover for ${song.name}`}
            className='song-image rounded-lg'
          />
          <div className='mx-2'>
            <strong className='w-auto'>{song.name}</strong>
            <br></br>
            <span className='w-auto text-gray-400'>{getArtistsNames(song)}</span>
          </div>
        </li>
      ))}
    </div>
  );
};

export default SearchForm;
