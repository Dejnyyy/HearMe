import React, { useState, useEffect } from 'react';
import SearchAlbums from '../SearchAlbums';
import { toast } from 'react-toastify';
import JSON from 'json5';
import styles from './FaveAlbum.module.css';
import { CSSTransition } from 'react-transition-group';

const FaveAlbum: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSelectedAlbum, setLastSelectedAlbum] = useState<any | null>(null);
  const [lastSelectedAlbumImg, setLastSelectedAlbumImg] = useState<any | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

  const fetchFavoriteAlbum = async () => {
    try {
      const response = await fetch('/api/getFavouriteAlbum');
      if (!response.ok) {
        console.log('Network response was not ok');
      }
      const albumData = await response.json();
      console.log(albumData.favoriteAlbum);
      console.log(albumData.favAlbImg);
      setLastSelectedAlbumImg(albumData.favAlbImg);
      setLastSelectedAlbum(albumData.favoriteAlbum);
    } catch (error) {
      console.error('Error fetching favorite album from database:', error);
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
    localStorage.setItem('lastSelectedAlbum', JSON.stringify(album));

    toast.success(`Favorite album set to ${album.name}`, {
      className: 'toast-message',
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    await fetchFavoriteAlbum();
    setIsOpen(false);
  };

  return (
    <div>
      <div className="rounded-md text-center cursor-pointer" onClick={toggleSearch}>
        {lastSelectedAlbum ? (
          <div>
            <h2>Favourite Album:</h2>
            <div className="bg-gray-700 rounded-2xl p-3 flex items-center">
              <img
                src={lastSelectedAlbumImg || 'default-image-url'}
                alt={`Image for ${lastSelectedAlbum}`}
                className={`album-image w-16 ml-2 rounded-lg ${styles.albumImage}`}
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
      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames={{
          enter: styles['modal-enter'],
          enterActive: styles['modal-enter-active'],
          exit: styles['modal-exit'],
          exitActive: styles['modal-exit-active'],
        }}
        unmountOnExit
      >
        <div className="w-auto lg:absolute mx-auto h-96 overflow-y-auto my-2 border rounded-lg bg-zinc-800">
          <SearchAlbums onAlbumClick={handleAlbumClick} />
        </div>
      </CSSTransition>
    </div>
  );
};

export default FaveAlbum;
