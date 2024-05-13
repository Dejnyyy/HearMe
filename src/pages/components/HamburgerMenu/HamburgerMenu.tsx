// components/HamburgerMenu.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './HamburgerMenu.module.css';
import { useSession } from "next-auth/react";

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: sessionData } = useSession();
  const isAdmin = sessionData?.user?.isAdmin; // Assuming isAdmin is a boolean in the user object

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className={styles.hamburgerMenu} onClick={toggleMenu}>
        <div className={`${styles.bar} ${isOpen ? styles.open : ''}`} />
        <div className={`${styles.bar} ${isOpen ? styles.open : ''}`} />
        <div className={`${styles.bar} ${isOpen ? styles.open : ''}`} />
      </div>

      {isOpen && (
        <div className="py-4 px-2 rounded-lg fixed left-2 top-10 bg-gray-800 text-white">
          <ul className="space-y-1">
            <li><Link href="/"><p className="font-mono font-semibold text-lg">Home</p></Link></li>
            <li><Link href="/profile"><p className="font-mono font-semibold text-lg">Profile</p></Link></li>
            <li><Link href="/calendar"><p className="font-mono font-semibold text-lg">Calendar</p></Link></li>
            <li><Link href="/ranking"><p className="font-mono font-semibold text-lg">Ranking</p></Link></li>
            <li><Link href="/explore"><p className="font-mono font-semibold text-lg">Explore</p></Link></li>
            <li><Link href="/vote"><p className="font-mono font-semibold text-lg">Vote</p></Link></li>
            {isAdmin && (
              <li><Link href="/uzivatele"><p className="font-mono font-semibold text-lg">Users</p></Link></li>
            )}
            <li><Link href="/friends"><p className="font-mono font-semibold text-lg">Friends</p></Link></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
