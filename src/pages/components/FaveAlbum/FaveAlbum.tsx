import React, { useState, useEffect } from "react";
import SearchAlbums from "../SearchAlbums";
import { toast } from "react-toastify";
import JSON from "json5";
import styles from "./FaveAlbum.module.css";
import { CSSTransition } from "react-transition-group";
import { Disc, Edit2 } from "lucide-react";

const FaveAlbum: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSelectedAlbum, setLastSelectedAlbum] = useState<any | null>(null);
  const [lastSelectedAlbumImg, setLastSelectedAlbumImg] = useState<any | null>(
    null,
  );
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

  const fetchFavoriteAlbum = async () => {
    try {
      const response = await fetch("/api/getFavouriteAlbum");
      if (!response.ok) {
        console.log("Network response was not ok");
      }
      const albumData = await response.json();
      setLastSelectedAlbumImg(albumData.favAlbImg);
      setLastSelectedAlbum(albumData.favoriteAlbum);
    } catch (error) {
      console.error("Error fetching favorite album from database:", error);
    }
  };

  useEffect(() => {
    fetchFavoriteAlbum();
  }, []);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleAlbumClick = async (album: any) => {
    if (selectedAlbum && selectedAlbum.id === album.id) {
      return;
    }

    setSelectedAlbum(album);
    localStorage.setItem("lastSelectedAlbum", JSON.stringify(album));

    toast.success(`Favorite album set to ${album.name}`);

    await fetchFavoriteAlbum();
    setIsOpen(false);
  };

  return (
    <div>
      <div
        className="group flex cursor-pointer items-center gap-4 rounded-2xl bg-gray-50 p-3 transition-all hover:bg-gray-100 dark:bg-black/20 dark:hover:bg-gray-800"
        onClick={toggleSearch}
      >
        {lastSelectedAlbumImg ? (
          <img
            src={lastSelectedAlbumImg}
            alt=""
            className="h-14 w-14 rounded-xl object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-gray-400 dark:bg-gray-800">
            <Disc className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
            {lastSelectedAlbum ?? "Select Album"}
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
          <SearchAlbums onAlbumClick={handleAlbumClick} />
        </div>
      </CSSTransition>
    </div>
  );
};

export default FaveAlbum;
