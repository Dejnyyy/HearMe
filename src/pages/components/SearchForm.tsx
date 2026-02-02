import { useState, useEffect, useCallback } from "react";
import { searchSpotifySongs, getAccessToken } from "../../utils/spotifyApi";

interface SearchFormProps {
  onSongClick: (selectedSong: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSongClick }) => {
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
    <div>
      <input
        className="focus:border-gold-500 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:outline-none"
        type="text"
        placeholder="Search for a song..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {isSearching && (
        <p className="mt-3 text-sm text-gray-500">Searching...</p>
      )}

      <div className="mt-3 space-y-2">
        {searchResults.map((song) => (
          <div
            className="hover:border-gold-500/30 flex cursor-pointer items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-800/50 p-3 transition-all hover:bg-gray-700/50"
            key={song.id}
            onClick={() => handleSongClick(song)}
          >
            <img
              src={song.album.images[2]?.url || "/default-userimage.png"}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{song.name}</p>
              <p className="truncate text-sm text-gray-500">
                {getArtistsNames(song)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchForm;
