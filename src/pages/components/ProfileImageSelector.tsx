import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { searchSpotifyArtists, getAccessToken } from "../../utils/spotifyApi";
import { toast } from "react-toastify";

interface ProfileImageSelectorProps {
  onImageSelected: (imageUrl: string) => void;
  onCancel: () => void;
}

const ProfileImageSelector: React.FC<ProfileImageSelectorProps> = ({
  onImageSelected,
  onCancel,
}) => {
  const { data: session, update } = useSession();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

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

  const updateProfileImage = async (imageUrl: string) => {
    const userId = session?.user.id;
    if (!userId) return;

    try {
      const response = await fetch("/api/updateProfileImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          imageUrl,
        }),
      });

      if (response.ok) {
        // Trigger session update to reflect the change immediately if possible
        await update({ image: imageUrl });
        onImageSelected(imageUrl);
        toast.success("Profile picture updated!");
      } else {
        console.error("Failed to update profile image");
        toast.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error("Error updating profile picture");
    }
  };

  const handleArtistClick = (artist: any) => {
    const imageUrl =
      artist.images[0]?.url || artist.images[1]?.url || artist.images[2]?.url;

    if (imageUrl) {
      updateProfileImage(imageUrl);
    } else {
      toast.error("No image available for this artist");
    }
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl) {
      updateProfileImage(customUrl);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
          Search Artist
        </h3>
        <input
          className="focus:border-gold-500 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          type="text"
          placeholder="Search artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="mb-4">
        <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
          Or paste Image URL
        </h3>
        <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
          <input
            className="focus:border-gold-500 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gold-500 hover:bg-gold-400 rounded-xl px-4 py-2 font-bold text-black transition"
          >
            Save
          </button>
        </form>
      </div>

      {isSearching && (
        <p className="mb-2 text-xs text-gray-500">Searching...</p>
      )}

      <div className="custom-scroll max-h-60 space-y-1 overflow-y-auto">
        {searchResults.map((artist) => (
          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            key={artist.id}
            onClick={() => handleArtistClick(artist)}
          >
            <img
              src={
                artist.images[2]?.url || // Use smaller image for list thumbnail
                artist.images[0]?.url ||
                "/default-userimage.png"
              }
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-medium text-gray-900 dark:text-white">
              {artist.name}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProfileImageSelector;
