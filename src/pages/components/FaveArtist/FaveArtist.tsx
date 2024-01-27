// components/FaveArtist.tsx
import React, { useState, useEffect } from 'react';
import styles from './FaveArtist.module.css';
import Link from 'next/link';

const FaveArtist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch] = useState(false);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <div className={styles.FaveArtist} onClick={toggleSearch}>
        Favourite Artist
       
      </div>
      {isOpen && (
        <div className={`py-4 px-2 rounded-lg absolute${showSearch ? 'show' : ''}`}>
            AHOJ
        </div>
      )}
    </div>
  );
};

export default FaveArtist;
