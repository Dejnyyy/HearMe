import React, { useState, useEffect } from "react";
import SearchArtists from "../SearchArtists";
import { toast } from "react-toastify";
import JSON from "json5";
import styles from "./FaveArtist.module.css";
import { CSSTransition } from "react-transition-group";
import { Mic, Edit2 } from "lucide-react";

const FaveArtist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [selectedLastArtist, setLastSelectedArtist] = useState<any | null>(
    null,
  );
  const [selectedLastArtistImg, setLastSelectedArtistImg] = useState<
    any | null
  >(null);

  const fetchFavoriteArtist = async () => {
    try {
      const response = await fetch("/api/getFavouriteArtist");
      if (!response.ok) {
        console.log("Network response was not ok");
      }
      const artistData = await response.json();
      setLastSelectedArtistImg(artistData.favArtImg);
      setLastSelectedArtist(artistData.favoriteArtist);
    } catch (error) {
      console.error("Error fetching favorite artist from database:", error);
    }
  };

  useEffect(() => {
    fetchFavoriteArtist();
  }, []);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleArtistClick = async (artist: any) => {
    if (selectedArtist && selectedArtist.id === artist.id) {
      return;
    }
    setSelectedArtist(artist);
    localStorage.setItem("lastSelectedArtist", JSON.stringify(artist));

    toast.success(`Favorite artist set to ${artist.name}`);

    await fetchFavoriteArtist();
    setIsOpen(false);
  };

  return (
    <div>
      <div
        className="group flex cursor-pointer items-center gap-4 rounded-2xl bg-gray-50 p-3 transition-all hover:bg-gray-100 dark:bg-black/20 dark:hover:bg-gray-800"
        onClick={toggleSearch}
      >
        {selectedLastArtistImg ? (
          <img
            src={selectedLastArtistImg}
            alt=""
            className="h-14 w-14 rounded-xl object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-gray-400 dark:bg-gray-800">
            <Mic className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
            {selectedLastArtist ?? "Select Artist"}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Tap to change
          </p>
        </div>
        <div className="group-hover:text-gold-500 mr-2 rounded-full p-2 text-gray-400 transition-colors group-hover:bg-white dark:group-hover:bg-black/40">
          <Edit2 className="h-4 w-4" />
        </div>
      </div>

      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames={{
          enter: styles["modal-enter"],
          enterActive: styles["modal-enter-active"],
          exit: styles["modal-exit"],
          exitActive: styles["modal-exit-active"],
        }}
        unmountOnExit
      >
        <div className="relative z-50 mt-4 max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <SearchArtists onArtistClick={handleArtistClick} />
        </div>
      </CSSTransition>
    </div>
  );
};

export default FaveArtist;
