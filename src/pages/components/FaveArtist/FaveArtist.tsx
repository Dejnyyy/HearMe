import React, { useState } from 'react';
import styles from './FaveArtist.module.css';
import SearchArtists from '../SearchArtists';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const FaveArtist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const router = useRouter();

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleArtistClick = (artist: any) => {
    console.log('Selected Artist:', artist);
    setSelectedArtist(artist);
    localStorage.setItem('selectedArtist', JSON.stringify(artist));
  };

  const handleVoteClick = () => {
    // Check if the user has already voted today
    const lastVoteDate = localStorage.getItem('lastVoteDate');
    const currentDate = new Date().toDateString();
    router.push('/');
    if (lastVoteDate === currentDate) {
      toast.error('You can only vote once a day.', {
        className: "toast-message",
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

    // Log the selected artist when the "Vote" button is clicked
    console.log('Vote clicked for:', selectedArtist);

    // Add any additional logic related to voting

    // Update the last vote date in local storage
    localStorage.setItem('lastVoteDate', currentDate);

    toast.success('Thank you for your vote!', {
      className: "toast-message",
      position: 'top-right',
      autoClose: 3000, // 3s
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    
  };

  return (
    <div>
      <div className="rounded-md border py-1 text-center cursor-pointer" onClick={toggleSearch}>
        Favourite Artist
      </div>
      {isOpen && (
        <div className=" absolute w-auto h-96 overflow-y-auto my-2 border rounded-lg bg-zinc-800">
          <SearchArtists onArtistClick={handleArtistClick} />
        </div>
      )}

      {selectedArtist && (
        <div className="absolute top-0 left">
          <h2>Selected Artist</h2>
          <p>{selectedArtist.name}</p>
          <button
            className="rounded-full bg-white px-10 py-3 font-mono font-semibold text-black no-underline transition hover:bg-white/50"
            onClick={handleVoteClick}
            disabled={!selectedArtist}
          >
            Vote
          </button>
        </div>
      )}
    </div>
  );
};

export default FaveArtist;
