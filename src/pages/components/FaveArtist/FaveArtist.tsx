import React, { useState, useEffect } from 'react';
import SearchArtists from '../SearchArtists';
import { toast } from 'react-toastify';
import JSON from 'json5';
import styles from './FaveArtist.module.css';
import { CSSTransition } from 'react-transition-group';

const FaveArtist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [selectedLastArtist, setLastSelectedArtist] = useState<any | null>(null);
  const [selectedLastArtistImg, setLastSelectedArtistImg] = useState<any | null>(null);

  useEffect(() => {
    const fetchFavoriteArtist = async () => {
      try {
        const response = await fetch('/api/getFavouriteArtist');
        if (!response.ok) {
          console.log('Network response was not ok');
        }
        const artistData = await response.json();
        console.log(artistData.favoriteArtist);
        console.log(artistData.favArtImg);
        setLastSelectedArtistImg(artistData.favArtImg);
        setLastSelectedArtist(artistData.favoriteArtist);
      } catch (error) {
        console.error('Error fetching favorite artist from database:', error);
      }
    };

    fetchFavoriteArtist();
  }, []);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleArtistClick = (artist: any) => {
    if (selectedArtist && selectedArtist.id === artist.id) {
      return;
    }
    console.log('Selected Artist:', artist);
    setSelectedArtist(artist);
    localStorage.setItem('lastSelectedArtist', JSON.stringify(artist));

    toast.success(`Favorite artist set to ${artist.name}`, {
      className: 'toast-message',
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
        {selectedLastArtist ? (
          <div>
            <h2>Favourite Artist:</h2>
            <div className="bg-gray-700 rounded-2xl p-3 flex items-center">
              <img
                src={selectedLastArtistImg || 'default-image-url'}
                alt={`Image for ${selectedLastArtist}`}
                className={`artist-image w-16 ml-2 rounded-lg ${styles.artistImage}`}
              />
              <div className="ml-2 ">
                <strong>{selectedLastArtist}</strong>
              </div>
            </div>
          </div>
        ) : (
          'Favorite Artist'
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
        <div className="mx-auto lg:absolute w-auto h-96 overflow-y-auto my-2 border rounded-lg bg-zinc-800">
          <SearchArtists onArtistClick={handleArtistClick} />
        </div>
      </CSSTransition>
    </div>
  );
};

export default FaveArtist;
