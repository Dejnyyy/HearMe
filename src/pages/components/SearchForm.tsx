import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { searchSpotifySongs, getAccessToken } from "../../utils/spotifyApi";

interface SearchFormProps {
  onSongClick: (selectedSong: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSongClick }) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const getArtistsNames = (track: any): string => {
    if (track.artists && track.artists.length > 0) {
      return track.artists.map((artist: any) => artist.name).join(", ");
    } else {
      return "Unknown Artist";
    }
  };

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const accessToken = await getAccessToken();
      if (accessToken) {
        const result = await searchSpotifySongs(query, accessToken);
        setSearchResults(result.tracks.items);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleSongClick = (clickedSong: any) => {
    onSongClick(clickedSong);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="font-mono font-semibold">
      <input
        className="m-3 w-2/3 rounded-md py-1 pl-2 text-black"
        type="text"
        placeholder="Search a song"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isSearching && (
        <span className="text-sm text-gray-400">Searching...</span>
      )}

      {searchResults.map((song) => (
        <li
          className="m-2 flex cursor-pointer list-none items-center rounded-lg px-2 py-2 hover:bg-gray-500"
          key={song.id}
          onClick={() => handleSongClick(song)}
        >
          <img
            src={song.album.images[2]?.url || "default-image-url"}
            alt={`Album cover for ${song.name}`}
            className="song-image rounded-lg"
          />
          <div className="mx-2">
            <strong className="w-auto">{song.name}</strong>
            <br></br>
            <span className="w-auto text-gray-400">
              {getArtistsNames(song)}
            </span>
          </div>
        </li>
      ))}
    </div>
  );
};

export default SearchForm;
