import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./HamburgerMenu.module.css";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  FaHome,
  FaUser,
  FaCalendarAlt,
  FaChartLine,
  FaCompass,
  FaVoteYea,
  FaUsers,
  FaUserShield,
  FaCrown,
  FaThumbsUp,
  FaSignOutAlt,
} from "react-icons/fa";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: <FaHome /> },
  { href: "/profile", label: "Profile", icon: <FaUser /> },
  { href: "/calendar", label: "Calendar", icon: <FaCalendarAlt /> },
  { href: "/rankingToday", label: "Ranking", icon: <FaChartLine /> },
  { href: "/explore", label: "Explore", icon: <FaCompass /> },
  { href: "/voteToday", label: "Vote", icon: <FaVoteYea /> },
  { href: "/friends", label: "Friends", icon: <FaUsers /> },
  //{ href: "/friendsCircles", label: "FriendCircles", icon: <FaUsers /> },
  // Admin
  { href: "/admin", label: "Users", icon: <FaUserShield />, adminOnly: true },
  {
    href: "/ranking",
    label: "Ranking Admin",
    icon: <FaCrown />,
    adminOnly: true,
  },
  { href: "/vote", label: "Vote Admin", icon: <FaThumbsUp />, adminOnly: true },
];

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: sessionData } = useSession();
  const isAdmin = !!(sessionData as any)?.user?.isAdmin;
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Detect mobile on client
  useEffect(() => {
    const update = () =>
      setIsMobile(typeof window !== "undefined" && window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Close on route change
  useEffect(() => {
    const handleRoute = () => setIsOpen(false);
    router.events.on("routeChangeStart", handleRoute);
    return () => router.events.off("routeChangeStart", handleRoute);
  }, [router.events]);

  // Esc to close + body scroll lock only when open on mobile
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);

    if (isMobile && isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isMobile]);

  const items = NAV_ITEMS.filter((i) => (i.adminOnly ? isAdmin : true));

  const isActive = (href: string) => {
    const path = router.asPath.split("?")[0];
    return path === href;
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const MenuList = (
    <ul className={styles.menuItems} role="menu" aria-label="Main navigation">
      {items.map((item) => (
        <li key={item.href} role="none">
          <Link
            href={item.href}
            className={`${styles.menuLink} ${
              isActive(item.href) ? styles.active : ""
            }`}
            role="menuitem"
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.menuText}>{item.label}</span>
          </Link>
        </li>
      ))}
      {/* Sign Out Button */}
      <li role="none" className={styles.signOutItem}>
        <button
          onClick={handleSignOut}
          className={styles.signOutBtn}
          role="menuitem"
        >
          <span className={styles.icon}>
            <FaSignOutAlt />
          </span>
          <span className={styles.menuText}>Sign Out</span>
        </button>
      </li>
    </ul>
  );

  /* ===== Desktop behavior: hover to open, button hides while open ===== */
  if (!isMobile) {
    return (
      <>
        {/* Fixed hamburger (hidden when open) */}
        <button
          className={`${styles.hamburgerBtnFixed} ${
            isOpen ? styles.hiddenBtn : ""
          }`}
          onMouseEnter={() => setIsOpen(true)}
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls="desktop-sidebar"
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>

        {/* Sidebar that appears on hover, closes when mouse leaves it */}
        <aside
          id="desktop-sidebar"
          ref={sidebarRef}
          className={`${styles.sidebarHover} ${
            isOpen ? styles.sidebarOpen : ""
          }`}
          onMouseLeave={() => setIsOpen(false)}
          aria-label="Sidebar"
        >
          <nav className={styles.sidebarInner}>{MenuList}</nav>
        </aside>
      </>
    );
  }
  return (
    <div className={styles.mobileWrap}>
      {/* Render button ONLY when closed */}
      {!isOpen && (
        <button
          className={styles.hamburgerBtnFixed}
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>
      )}

      {isOpen && (
        <div
          ref={overlayRef}
          id="mobile-menu"
          className={styles.menuOverlay}
          onClick={(e) => {
            if (e.target === overlayRef.current) setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <nav
            className={styles.mobileSheet}
            onClick={(e) => e.stopPropagation()}
          >
            {MenuList}
          </nav>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
