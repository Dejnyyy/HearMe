import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { searchSpotifyAlbums, getAccessToken } from "../../utils/spotifyApi";

interface SearchFormProps {
  onAlbumClick: (selectedAlbum: any) => void;
}

const SearchAlbums: React.FC<SearchFormProps> = ({ onAlbumClick }) => {
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
        const result = await searchSpotifyAlbums(query, accessToken);
        setSearchResults(result.albums.items);
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

  const handleAlbumClick = async (album: any) => {
    const userId = session?.user.id;

    try {
      const response = await fetch("/api/updateFavAlbum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          albumName: album.name,
          favAlbImg: album.images[2]?.url,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Favorite album updated:", data);
        onAlbumClick(album);
        setSearchResults([]);
        setSearchQuery("");
      } else {
        console.error("Failed to update favorite album:", data.error);
      }
    } catch (error) {
      console.error("Error updating favorite album:", error);
    }
  };

  return (
    <div>
      <input
        className="m-3 rounded-md py-1 pl-2 text-black"
        type="text"
        placeholder="Find your album..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isSearching && (
        <span className="text-sm text-gray-400">Searching...</span>
      )}

      {searchResults.map((album) => (
        <li
          className="m-2 flex cursor-pointer list-none items-center rounded px-2 hover:bg-gray-500"
          key={album.id}
          onClick={() => handleAlbumClick(album)}
        >
          <img
            src={album.images[2]?.url || "default-image-url"}
            alt={`Image for ${album.name}`}
            className="album-image h-auto w-20"
          />
          <div className="mx-2">
            <strong className="w-auto">{album.name}</strong>
          </div>
        </li>
      ))}
    </div>
  );
};

export default SearchAlbums;
