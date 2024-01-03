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
      let accessToken = await getAccessToken("8ad546d15e0c498db993f5f2899ae835","c4a7ca1b8c404757b70e5e5c147bb51c" );
     
      if (accessToken) {
        const result = await searchSpotifySongs(searchQuery, accessToken);
        setSearchResults(result.tracks.items);
      }
      else{
        console.log("no access token");
        //getAccessToken();
        console.log(accessToken);
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
