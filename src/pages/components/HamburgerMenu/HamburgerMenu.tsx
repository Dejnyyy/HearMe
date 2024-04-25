// components/HamburgerMenu.tsx
import React, { useState, useEffect } from 'react';
import styles from './HamburgerMenu.module.css';
import Link from 'next/link';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu] = useState(false);

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
        <div className={`py-4 px-2 rounded-lg fixed left-2 top-10 ${showMenu ? 'show' : ''}`}>
          <ul className="bg-gray-950 p-1 rounded-md">
            <li className={[styles.menu, 'py-0.5'].join(' ')}>
              <Link href="/">
                <p className="text-white font-mono font-semibold ml-2 text-lg">Home</p>
              </Link>
            </li>
            <li className={[styles.menu, 'py-0.5'].join(' ')}>
              <Link href="/profile">
                <p className="text-white font-mono font-semibold ml-2 text-lg">Profile</p>
              </Link>
            </li>
            <li className={[styles.menu, 'py-0.5'].join(' ')}>
              <Link href="/calendar">
                <p className="text-white font-mono font-semibold ml-2 text-lg">Calendar</p>
              </Link>
            </li>
            <li className={[styles.menu, 'py-0.5'].join(' ')}>
              <Link href="/ranking">
                <p className="text-white font-mono font-semibold ml-2 text-lg">Ranking</p>
              </Link>
            </li>
            <li className={[styles.menu, 'py-0.5'].join(' ')}>
              <Link href="/explore">
                <p className="text-white font-mono font-semibold ml-2 text-lg">Explore</p>
              </Link>
            </li>
            <li className={[styles.menu, 'py-0.5'].join(' ')}>
              <Link href="/vote">
                <p className="text-white font-mono font-semibold ml-2 text-lg">Vote</p>
              </Link>
            </li>
            <li className={[styles.menu, 'py-0.5'].join(' ')}>
              <Link href="/uzivatele">
                <p className="text-white font-mono font-semibold ml-2 text-lg">Users</p>
              </Link>
            </li>
            <li className={[styles.menu, 'py-0.5'].join(' ')}>
              <Link href="/friends">
                <p className="text-white font-mono font-semibold ml-2 text-lg">Friends</p>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
