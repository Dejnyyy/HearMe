import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { searchSpotifyArtists, getAccessToken } from '../../utils/spotifyApi'; // Correct import for searchSpotifyArtists
import { env } from "~/env.mjs";

interface SearchFormProps {
  onArtistClick: (selectedArtist: any) => void;
}

const SearchArtists: React.FC<SearchFormProps> = ({ onArtistClick }) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);


  const handleSearch = async () => {
    try {
      if (searchQuery.length > 1) {
        console.log(session?.user);
        let accessToken = await getAccessToken();
        console.log("Query: ", searchQuery);
        if (accessToken) {
          const result = await searchSpotifyArtists(searchQuery, accessToken); // Correct function call
          setSearchResults(result.artists.items);
        } else {
          console.log("no access token");
        }
      } else {
        console.log("too short search query");
      }
    } catch (error) {
      console.log(error);
    }
  };

  
const handleArtistClick = (artist: any) => {
    setSelectedArtist(artist); // Update the selected artist state
    localStorage.setItem('lastSelectedArtist', JSON.stringify(artist));
    onArtistClick(artist); // Pass the selected artist to the parent component
  };

  return (
    <div>
      <input
        className="rounded-md text-black py-1 m-3 pl-2"
        type="text"
        placeholder='Find your artist...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className='m-auto mr-2' onClick={handleSearch}>Search</button>


      {searchResults.map((artist) => (
        <li
          className='list-none px-2 flex items-center m-2 cursor-pointer rounded hover:bg-gray-500'
          key={artist.id}
          onClick={() => handleArtistClick(artist)}
        >
          <img
            src={artist.images[2]?.url || 'default-image-url'}
            alt={`Image for ${artist.name}`}
            className='artist-image w-20 h-auto'
          />
          <div className='mx-2'>
            <strong className='w-auto'>{artist.name}</strong>
          </div>
        </li>
      ))}
    </div>
  );
};

export default SearchArtists;
