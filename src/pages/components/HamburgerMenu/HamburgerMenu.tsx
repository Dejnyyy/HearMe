import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HamburgerMenu.module.css';
import { useSession } from "next-auth/react";
import { FaHome, FaUser, FaCalendarAlt, FaChartLine, FaCompass, FaVoteYea, FaUsers, FaUserShield, FaCrown, FaThumbsUp } from 'react-icons/fa';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: sessionData } = useSession();
  const isAdmin = sessionData?.user?.isAdmin;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = (
    <ul className={styles.menuItems}>
      <li><Link href="/"><p className={styles.menuText}><FaHome /> Home</p></Link></li>
      <li><Link href="/profile"><p className={styles.menuText}><FaUser /> Profile</p></Link></li>
      <li><Link href="/calendar"><p className={styles.menuText}><FaCalendarAlt /> Calendar</p></Link></li>
      <li><Link href="/rankingToday"><p className={styles.menuText}><FaChartLine /> Ranking</p></Link></li>
      <li><Link href="/explore"><p className={styles.menuText}><FaCompass /> Explore</p></Link></li>
      <li><Link href="/voteToday"><p className={styles.menuText}><FaVoteYea /> Vote</p></Link></li>
      <li><Link href="/friends"><p className={styles.menuText}><FaUsers /> Friends</p></Link></li>
      {isAdmin && (
        <>
          <li><Link href="/admin"><p className={styles.menuText}><FaUserShield /> Users</p></Link></li>
          <li><Link href="/ranking"><p className={styles.menuText}><FaCrown /> Ranking Admin</p></Link></li>
          <li><Link href="/vote"><p className={styles.menuText}><FaThumbsUp /> Vote Admin</p></Link></li>
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
            <div className={`${styles.menuOverlay} ${isOpen ? styles.show : ''}`}>
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
