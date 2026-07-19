'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

const navItems = [
  { href: '/', label: 'Command', icon: '◈' },
  { href: '/map', label: 'Venue', icon: '🗺️' },
  { href: '/chat', label: 'Fan AI', icon: '✦' },
  { href: '/navigate', label: 'Route', icon: '🧭' },
  { href: '/feed', label: 'Alerts', icon: '📢' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} role="navigation" aria-label="Mobile navigation">
      <div className={styles.navItems}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            aria-current={pathname === item.href ? 'page' : undefined}
            aria-label={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
