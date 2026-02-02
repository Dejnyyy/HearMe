import React, { useState, useEffect } from "react";
import SearchAlbums from "../SearchAlbums";
import { toast } from "react-toastify";
import JSON from "json5";
import styles from "./FaveAlbum.module.css";
import { CSSTransition } from "react-transition-group";

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

    toast.success(`Favorite album set to ${album.name}`, {
      position: "top-right",
      autoClose: 3000,
    });

    await fetchFavoriteAlbum();
    setIsOpen(false);
  };

  return (
    <div>
      <div
        className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-all hover:bg-white/5"
        onClick={toggleSearch}
      >
        {lastSelectedAlbumImg ? (
          <img
            src={lastSelectedAlbumImg}
            alt=""
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
            <span className="text-xl">💿</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">
            {lastSelectedAlbum ?? "Click to select"}
          </p>
          <p className="text-xs text-gray-500">Tap to change</p>
        </div>
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
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
        <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-gray-800/80 backdrop-blur">
          <SearchAlbums onAlbumClick={handleAlbumClick} />
        </div>
      </CSSTransition>
    </div>
  );
};

export default FaveAlbum;
