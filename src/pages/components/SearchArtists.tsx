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

  // Debounced search effect
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
        console.log("Favorite artist updated:", data);
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
    <div>
      <input
        className="m-3 rounded-md py-1 pl-2 text-black"
        type="text"
        placeholder="Find your artist..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isSearching && (
        <span className="text-sm text-gray-400">Searching...</span>
      )}

      {searchResults.map((artist) => (
        <li
          className="m-2 flex cursor-pointer list-none items-center rounded px-2 hover:bg-gray-500"
          key={artist.id}
          onClick={() => handleArtistClick(artist)}
        >
          <img
            src={artist.images[2]?.url || "default-image-url"}
            alt={`Image for ${artist.name}`}
            className="artist-image h-auto w-20"
          />
          <div className="mx-2">
            <strong className="w-auto">{artist.name}</strong>
          </div>
        </li>
      ))}
    </div>
  );
};

export default SearchArtists;
