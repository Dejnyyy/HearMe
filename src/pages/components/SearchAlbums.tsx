// SearchAbums.tsx
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { searchSpotifyAlbums, getAccessToken } from '../../utils/spotifyApi'; // Correct import for searchSpotifyAlbums
import { env } from "~/env.mjs";

interface SearchFormProps {
  onAlbumClick: (selectedAlbum: any) => void;
}

const SearchAlbums: React.FC<SearchFormProps> = ({ onAlbumClick }) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

  const handleSearch = async () => {
    try {
      if (searchQuery.length > 1) {
        console.log(session?.user);
        let accessToken = await getAccessToken();
        console.log("Query: ", searchQuery);
        if (accessToken) {
          const result = await searchSpotifyAlbums(searchQuery, accessToken); // Correct function call
          setSearchResults(result.albums.items);
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAlbumClick = async (album: any) => {
    setSelectedAlbum(album);
    const userId = session?.user.id;

    try {
      const response = await fetch('/api/updateFavAlbum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          albumName: album.name,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Favorite album updated:', data);
        onAlbumClick(album);
      } else {
        console.error('Failed to update favorite album:', data.error);
      }
    } catch (error) {
      console.error('Error updating favorite album:', error);
    }
};


  return (
    <div>
      <input
        className="rounded-md text-black py-1 m-3 pl-2"
        type="text"
        placeholder='Find your album...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className='m-auto mr-2' onClick={handleSearch}>Search</button>

      {searchResults.map((album) => (
        <li
          className='list-none px-2 flex items-center m-2 cursor-pointer rounded hover:bg-gray-500'
          key={album.id}
          onClick={() => handleAlbumClick(album)}
        >
          <img
            src={album.images[2]?.url || 'default-image-url'}
            alt={`Image for ${album.name}`}
            className='album-image w-20 h-auto'
          />
          <div className='mx-2'>
            <strong className='w-auto'>{album.name}</strong>
          </div>
        </li>
      ))}
    </div>
  );
};

export default SearchAlbums;
