// FaveAlbum.tsx
import React, { useState, useEffect } from 'react';
import styles from './FaveArtist.module.css';
import SearchAlbums from '../SearchAlbums'; // Update the import for the SearchAlbums component
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const FaveAlbum: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSelectedAlbum, setLastSelectedAlbum] = useState<any | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [votedAlbum, setVotedAlbum] = useState<any | null>(null); // New state for the voted album

  const router = useRouter();

  useEffect(() => {
    try {
      const storedLastSelectedAlbum = localStorage.getItem('lastSelectedAlbum');
      if (storedLastSelectedAlbum) {
        setLastSelectedAlbum(JSON.parse(storedLastSelectedAlbum));
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Save selected album to localStorage when selectedAlbum changes
    if (selectedAlbum) {
      localStorage.setItem('selectedAlbum', JSON.stringify(selectedAlbum));
    }
  }, [selectedAlbum]);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleAlbumClick = (album: any) => {
    console.log('Selected Album:', album);
    setSelectedAlbum(album);
  };

  const handleVoteClick = () => {
    // Check if the user has already voted today
    const lastVoteDate = localStorage.getItem('lastVoteDate - Album');
    const currentDate = new Date().toDateString();
    router.push('/');

    if (lastVoteDate === currentDate) {
      toast.error('You can only vote once a day.', {
        className: 'toast-message',
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    if (!selectedAlbum) {
      toast.error('Please select an album before voting.', {
        className: 'toast-message',
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    console.log('Vote clicked for:', selectedAlbum);
    // Update the last vote date in local storage
    localStorage.setItem('lastVoteDate - Album', currentDate);
    // Set voted album and clear selected album
    setVotedAlbum(selectedAlbum);
    setSelectedAlbum(null);
    // Update the last voted album in local storage
    localStorage.setItem('lastSelectedAlbum', JSON.stringify(selectedAlbum));

    setIsOpen(false);

    toast.success('Thank you for your vote!', {
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
        {selectedAlbum ? (
          <div>
            <h2>Selected Album:</h2>
            <div className="border rounded-md p-3 flex items-center">
              <img
                src={selectedAlbum.images[2]?.url || 'default-image-url'}
                alt={`Image for ${selectedAlbum.name}`}
                className="album-image w-20 h-auto"
              />
              <div className="ml-2">
                <strong>{selectedAlbum.name}</strong>
              </div>
            </div>
          </div>
        ) : lastSelectedAlbum ? (
          <div>
            <h2>Favourite Album:</h2>
            <div className="border rounded-md p-3 flex items-center w-auto">
              <img
                src={lastSelectedAlbum.images[2]?.url || 'default-image-url'}
                alt={`Image for ${lastSelectedAlbum.name}`}
                className="album-image w-20 h-auto"
              />
              <div className="ml-2">
                <strong>{lastSelectedAlbum.name}</strong>
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

      {selectedAlbum && (
        <div className="absolute top-0 left">
          <button
            className="rounded-full bg-white px-10 py-3 font-mono font-semibold text-black no-underline transition hover:bg-white/50"
            onClick={handleVoteClick}
          >
            Vote
          </button>
        </div>
      )}
    </div>
  );
};

export default FaveAlbum;
