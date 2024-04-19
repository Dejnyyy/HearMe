// FaveAlbum.tsx
import React, { useState, useEffect } from 'react';
import styles from './FaveAlbum.module.css';
import SearchAlbums from '../SearchAlbums';
import { toast } from 'react-toastify';
import JSON from 'json5';

const FaveAlbum: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSelectedAlbum, setLastSelectedAlbum] = useState<any | null>(null);
  const [lastSelectedAlbumImg, setLastSelectedAlbumImg] = useState<any | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

  useEffect(() => {
  const fetchFavoriteAlbum = async () => {
      try {
        const response = await fetch('/api/getFavouriteAlbum'); // Nahradit skutečnou cestou k vašemu API
       
        if (!response.ok) {
          throw console.log('Network response was not ok');
        }
        const albumData = await response.json();
        console.log(albumData.favoriteAlbum);
        console.log(albumData.favAlbImg);
        setLastSelectedAlbumImg(albumData.favAlbImg);
        setLastSelectedAlbum(albumData.favoriteAlbum);
      } catch (error) {
        console.error('Error fetching favorite album from database:', error);
      }
      return 
    };

    fetchFavoriteAlbum();
  }, []);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleAlbumClick = (album: any) => {
    if (selectedAlbum && selectedAlbum.id === album.id) {
      // If the clicked album is the same as the currently selected album, do nothing
      return;
    }
    console.log('Selected Album:', album);
    setSelectedAlbum(album);
    localStorage.setItem('lastSelectedAlbum', JSON.stringify(album));
  
    // Show a success toast notification
    toast.success(`Favorite album set to ${album.name}`, {
      className: "toast-message",
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div>
      <div className="rounded-md text-center cursor-pointer" onClick={toggleSearch}>
        { lastSelectedAlbum ? (
          <div>
            <h2>Favourite Album:</h2>
            <div className="bg-gray-700 rounded-2xl p-3 flex items-center">
              <img
                src={lastSelectedAlbumImg || 'default-image-url'}
                alt={`Image for ${lastSelectedAlbum}`}
                className="artist-image w-16 ml-2 rounded-xl"
              />
              <div className="ml-2">
                <strong>{lastSelectedAlbum}</strong>
              </div>
            </div>
          </div>
        ) : (
          'Favorite Album'
        )}
      </div>
      {isOpen && (
        <div className="absolute w-auto h-96 overflow-y-auto my-2 border rounded-lg bg-zinc-800">
          <SearchAlbums onAlbumClick={handleAlbumClick} />
        </div>
      )}
    </div>
  );
};

export default FaveAlbum;
