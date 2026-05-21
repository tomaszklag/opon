'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Text } from '@opony/design-system-web';
import { useAuth } from '../../../lib/auth';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { usePause, isIndefinitePause } from '../../../lib/hooks/use-pause';
import {
  IconDashboard,
  IconBookings,
  IconCalendar,
  IconCalendarOff,
  IconLogOut,
  IconPause,
  IconProfile,
  IconReviews,
  IconServices,
  IconSettings,
  IconStations,
  IconWorkers,
  IconWarehouse,
} from '../../../components/icons';
import styles from './DashboardNav.module.css';

// ── Component ──────────────────────────────────────────────────────────────

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  useAuthGuard('/dashboard');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  const { isPaused, pausedUntil } = usePause();

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar} aria-label="Nawigacja główna">
        <div className={styles.brand}>
          <span className={styles.logo}>OPONY</span>
          <Text variant="nano" as="span" className={styles.tag}>
            Panel
          </Text>
        </div>

        <nav className={styles.nav}>
          <Text variant="nano" as="span" className={styles.navSection}>
            Dziś
          </Text>
          <a
            href="/dashboard"
            className={`${styles.navItem} ${isActive('/dashboard') ? styles.navActive : ''}`}
          >
            <IconDashboard width="15" height="15" />
            Dashboard
          </a>
          <a
            href="/dashboard/calendar"
            className={`${styles.navItem} ${isActive('/dashboard/calendar') ? styles.navActive : ''}`}
          >
            <IconCalendar width="15" height="15" />
            Kalendarz
          </a>
          <a
            href="/dashboard/bookings"
            className={`${styles.navItem} ${isActive('/dashboard/bookings') ? styles.navActive : ''}`}
          >
            <IconBookings width="15" height="15" />
            Rezerwacje
          </a>

          <Text variant="nano" as="span" className={styles.navSection}>
            Warsztat
          </Text>
          <a
            href="/dashboard/services"
            className={`${styles.navItem} ${isActive('/dashboard/services') ? styles.navActive : ''}`}
          >
            <IconServices width="15" height="15" />
            Usługi & Cennik
          </a>
          <a
            href="/dashboard/stations"
            className={`${styles.navItem} ${isActive('/dashboard/stations') ? styles.navActive : ''}`}
          >
            <IconStations width="15" height="15" />
            Stanowiska
          </a>
          <a
            href="/dashboard/workers"
            className={`${styles.navItem} ${isActive('/dashboard/workers') ? styles.navActive : ''}`}
          >
            <IconWorkers width="15" height="15" />
            Pracownicy
          </a>
          <a
            href="/dashboard/depot"
            className={`${styles.navItem} ${isActive('/dashboard/depot') ? styles.navActive : ''}`}
          >
            <IconWarehouse width="15" height="15" />
            Skład
          </a>
          <a
            href="/dashboard/closures"
            className={`${styles.navItem} ${isActive('/dashboard/closures') ? styles.navActive : ''}`}
          >
            <IconCalendarOff width="15" height="15" />
            Zamknięcia
          </a>
          <a
            href="/dashboard/reviews"
            className={`${styles.navItem} ${isActive('/dashboard/reviews') ? styles.navActive : ''}`}
          >
            <IconReviews width="15" height="15" />
            Opinie
          </a>

          <Text variant="nano" as="span" className={styles.navSection}>
            Konto
          </Text>
          <a
            href="/dashboard/profile"
            className={`${styles.navItem} ${isActive('/dashboard/profile') ? styles.navActive : ''}`}
          >
            <IconProfile width="15" height="15" />
            Profil firmy
          </a>
          <a
            href="/dashboard/settings"
            className={`${styles.navItem} ${isActive('/dashboard/settings') ? styles.navActive : ''}`}
          >
            <IconSettings width="15" height="15" />
            Ustawienia konta
          </a>
        </nav>

        <div className={styles.footer}>
          {isPaused && pausedUntil && (
            <a href="/dashboard/settings#sec-pause" className={styles.pauseBadge}>
              <IconPause width="11" height="11" />
              {isIndefinitePause(pausedUntil)
                ? 'PAUZA · bezterminowo'
                : `PAUZA · do ${new Date(pausedUntil).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`}
            </a>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <IconLogOut width={14} height={14} />
            Wyloguj
          </button>
        </div>
      </aside>
    </>
  );
}
