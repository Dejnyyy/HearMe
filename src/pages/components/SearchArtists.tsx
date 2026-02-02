import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { searchSpotifyArtists, getAccessToken } from "../../utils/spotifyApi";

interface SearchFormProps {
  onArtistClick: (selectedArtist: any) => void;
}

const SearchArtists: React.FC<SearchFormProps> = ({ onArtistClick }) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const accessToken = await getAccessToken();
      if (accessToken) {
        const result = await searchSpotifyArtists(query, accessToken);
        setSearchResults(result.artists.items);
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

  const handleArtistClick = async (artist: any) => {
    const userId = session?.user.id;
    try {
      const response = await fetch("/api/updateFavArtist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          artistName: artist.name,
          favArtImg: artist.images[2]?.url,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onArtistClick(artist);
        setSearchResults([]);
        setSearchQuery("");
      } else {
        console.error("Failed to update favorite artist:", data.error);
      }
    } catch (error) {
      console.error("Error updating favorite artist:", error);
    }
  };

  return (
    <div className="p-3">
      <input
        className="focus:border-gold-500 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
        type="text"
        placeholder="Search artist..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isSearching && (
        <p className="mt-2 text-xs text-gray-500">Searching...</p>
      )}

      <div className="mt-2 space-y-1">
        {searchResults.map((artist) => (
          <div
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-700"
            key={artist.id}
            onClick={() => handleArtistClick(artist)}
          >
            <img
              src={artist.images[2]?.url || "/default-userimage.png"}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-medium text-white">{artist.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchArtists;
