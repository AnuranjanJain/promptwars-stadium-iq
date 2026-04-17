'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './BottomNav.module.css';

const navItems = [
  { href: '/map', label: 'Map', icon: '🗺️' },
  { href: '/chat', label: 'AI Chat', icon: '🤖' },
  { href: '/', label: 'Home', icon: '🏟️' },
  { href: '/queues', label: 'Queues', icon: '⏱️' },
  { href: '/feed', label: 'Feed', icon: '📢' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} role="navigation" aria-label="Mobile navigation">
      <div className={styles.navItems}>
        {navItems.slice(0, 2).map(item => (
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
        <div style={{ transform: 'scale(1.2)' }}>
          <ThemeToggle />
        </div>
        {navItems.slice(2).map(item => (
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
