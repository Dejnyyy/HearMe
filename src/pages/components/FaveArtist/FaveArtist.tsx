// FaveArtist.tsx
import React, { useState, useEffect } from 'react';
import styles from './FaveArtist.module.css';
import SearchArtists from '../SearchArtists';
import { toast } from 'react-toastify';

const FaveArtist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);

  useEffect(() => {
    try {
      const storedLastSelectedArtist = localStorage.getItem('lastSelectedArtist');
      if (storedLastSelectedArtist) {
        setSelectedArtist(JSON.parse(storedLastSelectedArtist));
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleArtistClick = (artist: any) => {
    console.log('Selected Artist:', artist);
    setSelectedArtist(artist);

    localStorage.setItem('lastSelectedArtist', JSON.stringify(artist));
  };

  return (
    <div>
      <div className="rounded-md text-center cursor-pointer" onClick={toggleSearch}>
        {selectedArtist ? (
          <div>
            <h2>Selected Artist:</h2>
            <div className="border rounded-md p-3 flex items-center">
              <img
                src={selectedArtist.images[2]?.url || 'default-image-url'}
                alt={`Image for ${selectedArtist.name}`}
                className="artist-image w-20 h-auto"
              />
              <div className="ml-2">
                <strong>{selectedArtist.name}</strong>
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
