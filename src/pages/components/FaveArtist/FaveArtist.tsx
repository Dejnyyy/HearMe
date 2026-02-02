import React, { useState, useEffect } from "react";
import SearchArtists from "../SearchArtists";
import { toast } from "react-toastify";
import JSON from "json5";
import styles from "./FaveArtist.module.css";
import { CSSTransition } from "react-transition-group";

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

    toast.success(`Favorite artist set to ${artist.name}`, {
      position: "top-right",
      autoClose: 3000,
    });

    await fetchFavoriteArtist();
    setIsOpen(false);
  };

  return (
    <div>
      <div
        className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-all hover:bg-gray-800"
        onClick={toggleSearch}
      >
        {selectedLastArtistImg ? (
          <img
            src={selectedLastArtistImg}
            alt=""
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
            <span className="text-xl">🎤</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">
            {selectedLastArtist ?? "Click to select"}
          </p>
          <p className="text-xs text-gray-600">Tap to change</p>
        </div>
        <svg
          className="text-gold-500 h-4 w-4"
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
        <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-gray-700 bg-gray-800">
          <SearchArtists onArtistClick={handleArtistClick} />
        </div>
      </CSSTransition>
    </div>
  );
};

export default FaveArtist;
