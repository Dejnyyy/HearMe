import React, { useState, useEffect } from 'react';
import styles from './FaveArtist.module.css';
import SearchArtists from '../SearchArtists';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
// ... (previous imports)

const FaveArtist: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastVotedArtist, setLastVotedArtist] = useState<any | null>(null);
    const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  
    const router = useRouter();
  
    useEffect(() => {
      try {
        const storedLastVotedArtist = localStorage.getItem('lastVotedArtist');
        if (storedLastVotedArtist) {
          setLastVotedArtist(JSON.parse(storedLastVotedArtist));
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }, []); // Run only on mount
  
    const toggleSearch = () => {
      setIsOpen(!isOpen);
    };
  
    const handleArtistClick = (artist: any) => {
      console.log('Selected Artist:', artist);
      setSelectedArtist(artist);
    };
  
    const handleVoteClick = () => {
      // Check if the user has already voted today
      const lastVoteDate = localStorage.getItem('lastVoteDate');
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
  
      console.log('Vote clicked for:', selectedArtist);
      // Update the last vote date in local storage
      localStorage.setItem('lastVoteDate - Artist', currentDate);
      // Set isOpen to false to show the section with the "Vote" button
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
          ) : lastVotedArtist ? (
            <div>
              <h2>Favourite Artist:</h2>
              <div className="border rounded-md p-3 flex items-center">
                <img
                  src={lastVotedArtist.images[2]?.url || 'default-image-url'}
                  alt={`Image for ${lastVotedArtist.name}`}
                  className="artist-image w-20 h-auto"
                />
                <div className="ml-2">
                  <strong>{lastVotedArtist.name}</strong>
                </div>
              </div>
            </div>
          ) : (
            'Favorite Artist'
          )}
        </div>
        {isOpen && (
          <div className=" absolute w-auto h-96 overflow-y-auto my-2 border rounded-lg bg-zinc-800">
            <SearchArtists onArtistClick={handleArtistClick} />
          </div>
        )}
  
        {selectedArtist && (
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
  
  export default FaveArtist;
  