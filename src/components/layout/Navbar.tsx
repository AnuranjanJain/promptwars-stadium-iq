'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/components/AppProvider';
import styles from './Navbar.module.css';

const navItems = [
  { href: '/map', label: 'Map', icon: '🗺️' },
  { href: '/chat', label: 'Stadium Buddy', icon: '🤖' },
  { href: '/queues', label: 'Queues', icon: '⏱️' },
  { href: '/navigate', label: 'Navigate', icon: '🧭' },
  { href: '/feed', label: 'Feed', icon: '📢' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { gameState } = useAppContext();

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      <div className={styles.navInner}>
        <Link href="/" className={styles.brand} aria-label="StadiumIQ Home">
          <span className={styles.logo}>🏟️</span>
          <span className={styles.brandName}>StadiumIQ</span>
        </Link>

        <div className={styles.navLinks}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {gameState.status === 'live' && (
          <div className={styles.gameScore} aria-live="polite">
            <span className={styles.liveIndicator}>
              <span className="status-dot live" />
              LIVE
            </span>
            <span className={styles.scoreText}>
              {gameState.homeTeam.split(' ').pop()} {gameState.homeScore} - {gameState.awayScore} {gameState.awayTeam.split(' ').pop()}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
