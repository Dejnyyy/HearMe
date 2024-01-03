import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { searchSpotifySongs, getAccessToken } from '../utils/spotifyApi';

const SearchForm: React.FC = () => {

  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {

      // Update this line based on the actual structure of your session object
      console.log(session?.user);
      const accessToken = session?.user?.accessToken;

      if (accessToken) {
        const result = await searchSpotifySongs(searchQuery, accessToken);
        setSearchResults(result.tracks.items);
      }
      else{
        console.log("no access token");
        //getAccessToken();

      }
    }  catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <input
        className="rounded-md text-black py-1 m-3 pl-2"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className='ml-16' onClick={handleSearch}>Search</button>

      {searchResults.map((song) => (
        <div key={song.id}>{song.name}</div>
      ))}
    </div>
  );
};

export default SearchForm;
