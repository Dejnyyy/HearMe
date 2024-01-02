// SearchForm.tsx
import axios from 'axios';
import React, { useState } from 'react';

interface Track {
  // Define your track properties here
  // For example, name, artist, etc.
  name: string;
  artist: string;
  album: string;
}

const SearchForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get('/search', {
        params: { query: searchQuery },
      });

      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching songs:', error);
    }
  };

  return (
    <div>
      <input type="text" className='text-black rounded-lg mx-1 my-1 py-1' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map((track) => (
          <li key={track.name}>
            {track.name} by {track.artist}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchForm;
