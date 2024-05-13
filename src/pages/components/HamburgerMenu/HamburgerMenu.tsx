// components/HamburgerMenu.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './HamburgerMenu.module.css';

type Props = {
  isAdmin: boolean;
};

const HamburgerMenu: React.FC<Props> = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="py-4 px-2 rounded-lg fixed left-2 top-10 text-white">
          <ul className="space-y-1">
            <li>
              <Link href="/">
               <p className="font-mono font-semibold text-lg">Home</p>
              </Link>
            </li>
            <li>
              <Link href="/profile">
               <p className="font-mono font-semibold text-lg">Profile</p>
              </Link>
            </li>
            <li>
              <Link href="/calendar">
               <p className="font-mono font-semibold text-lg">Calendar</p>
              </Link>
            </li>
            <li>
              <Link href="/ranking">
               <p className="font-mono font-semibold text-lg">Ranking</p>
              </Link>
            </li>
            <li>
              <Link href="/explore">
               <p className="font-mono font-semibold text-lg">Explore</p>
              </Link>
            </li>
            <li>
              <Link href="/vote">
               <p className="font-mono font-semibold text-lg">Vote</p>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link href="/users">
                 <p className="font-mono font-semibold text-lg">Users</p>
                </Link>
              </li>
            )}
            <li>
              <Link href="/friends">
               <p className="font-mono font-semibold text-lg">Friends</p>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
