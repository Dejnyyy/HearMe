// components/HamburgerMenu.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HamburgerMenu.module.css';
import { useSession } from "next-auth/react";

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: sessionData } = useSession();
  const isAdmin = sessionData?.user?.isAdmin;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust this value based on your design
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call the function initially

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = (
    <ul className="space-y-1">
      <li><Link href="/"><p className="font-mono font-semibold text-lg cursor-pointer">Home</p></Link></li>
      <li><Link href="/profile"><p className="font-mono font-semibold text-lg cursor-pointer">Profile</p></Link></li>
      <li><Link href="/calendar"><p className="font-mono font-semibold text-lg cursor-pointer">Calendar</p></Link></li>
      <li><Link href="/rankingToday"><p className="font-mono font-semibold text-lg cursor-pointer">Ranking</p></Link></li>
      <li><Link href="/explore"><p className="font-mono font-semibold text-lg cursor-pointer">Explore</p></Link></li>
      <li><Link href="/voteToday"><p className="font-mono font-semibold text-lg cursor-pointer">Vote</p></Link></li>
      <li><Link href="/friends"><p className="font-mono font-semibold text-lg cursor-pointer">Friends</p></Link></li>
      {isAdmin && (
        <>
          <li><Link href="/admin"><p className="font-mono font-semibold text-lg border-t-2 cursor-pointer">Users</p></Link></li>
          <li><Link href="/ranking"><p className="font-mono font-semibold text-lg cursor-pointer">Ranking Admin</p></Link></li>
          <li><Link href="/vote"><p className="font-mono font-semibold text-lg cursor-pointer">Vote Admin</p></Link></li>
        </>
      )}
    </ul>
  );

  return (
    <div>
      {isMobile ? (
        <div>
          <div className={styles.hamburgerMenu} onClick={toggleMenu}>
            <div className={`${styles.bar} ${isOpen ? styles.open : ''}`} />
            <div className={`${styles.bar} ${isOpen ? styles.open : ''}`} />
            <div className={`${styles.bar} ${isOpen ? styles.open : ''}`} />
          </div>

          {isOpen && (
            <div className={`menu ${styles.menu} show`}>
              {menuItems}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.sidebarContainer}>
          <div className={styles.sidebar}>
            {menuItems}
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
