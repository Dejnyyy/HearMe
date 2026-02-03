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
          favAlbImg:
            album.images[0]?.url ||
            album.images[1]?.url ||
            album.images[2]?.url,
        }),
      });

      const data = await response.json();
      if (response.ok) {
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
    <div className="p-3">
      <input
        className="focus:border-gold-500 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        type="text"
        placeholder="Search album..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isSearching && (
        <p className="mt-2 text-xs text-gray-500">Searching...</p>
      )}

      <div className="mt-2 space-y-1">
        {searchResults.map((album) => (
          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            key={album.id}
            onClick={() => handleAlbumClick(album)}
          >
            <img
              src={album.images[2]?.url || "/default-userimage.png"}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-medium text-gray-900 dark:text-white">
              {album.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchAlbums;
