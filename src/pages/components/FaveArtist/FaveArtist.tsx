import React, { useState, useEffect } from 'react';
import styles from './FaveArtist.module.css';
import SearchArtists from '../SearchArtists';
import { toast } from 'react-toastify';
import JSON from 'json5';

const FaveArtist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [selectedLastArtist, setLastSelectedArtist] = useState<any | null>(null);
  const [selectedLastArtistImg, setLastSelectedArtistImg] = useState<any | null>(null);



  useEffect(() => {
    const fetchFavoriteArtist = async () => {
      try {
        const response = await fetch('/api/getFavouriteArtist'); // Nahradit skutečnou cestou k vašemu API
       
        if (!response.ok) {
          throw console.log('Network response was not ok');
        }
        const artistData = await response.json();
        console.log(artistData.favoriteArtist);
        console.log(artistData.favArtImg);
        setLastSelectedArtistImg(artistData.favArtImg);
        setLastSelectedArtist(artistData.favoriteArtist);
      } catch (error) {
        console.error('Error fetching favorite album from database:', error);
      }
      return 
    };

    fetchFavoriteArtist();
  }, []);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleArtistClick = (artist: any) => {
    if (selectedArtist && selectedArtist.id === artist.id) {
      // If the clicked artist is the same as the currently selected artist, do nothing
      return;
    }
  
    console.log('Selected Artist:', artist);
    setSelectedArtist(artist);
    localStorage.setItem('lastSelectedArtist', JSON.stringify(artist));
  
    // Show a success toast notification
    toast.success(`Favorite artist set to ${artist.name}`, {
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
        { selectedLastArtist ? (
          <div>
            <h2>Favourite Artist:</h2>
            <div className="bg-gray-700 rounded-2xl p-3 flex items-center">
              <img
                src={selectedLastArtistImg || 'default-image-url'}
                alt={`Image for ${selectedLastArtist}`}
                className="artist-image w-16 ml-2 rounded-lg"
              />
              <div className="ml-2">
                <strong className=''>{selectedLastArtist}</strong>
              </div>
            </div>
          </div>
        ) : (
          'Favorite Artist'
        )}
      </div>
      {isOpen && (
        <div className="absolute w-auto h-96 overflow-y-auto my-2 border rounded-lg bg-zinc-800">
          <SearchArtists onArtistClick={handleArtistClick} />
        </div>
      )}
    </div>
  );
};

export default FaveArtist;
