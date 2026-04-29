'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Text } from '@opony/design-system-web';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import {
  IconDashboard,
  IconBookings,
  IconCalendar,
  IconPricing,
  IconHours,
  IconProfile,
  IconStations,
  IconWorkers,
} from '../../../components/icons';
import styles from './DashboardNav.module.css';

type ProviderStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

interface ProviderMini {
  name: string;
  status: ProviderStatus;
}

const STATUS_LABEL: Record<ProviderStatus, string> = {
  PENDING: 'Oczekuje na weryfikację',
  APPROVED: 'Aktywna',
  SUSPENDED: 'Zawieszona',
};

const STATUS_CLASS: Record<ProviderStatus, string> = {
  PENDING: styles.statusPending ?? '',
  APPROVED: styles.statusApproved ?? '',
  SUSPENDED: styles.statusSuspended ?? '',
};

const PAGE_TITLE: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/calendar': 'Kalendarz',
  '/dashboard/hours': 'Godziny pracy',
  '/dashboard/pricing': 'Cennik',
  '/dashboard/stations': 'Stanowiska',
  '/dashboard/workers': 'Pracownicy',
  '/dashboard/bookings': 'Rezerwacje',
  '/dashboard/profile': 'Profil firmy',
};

// ── Component ──────────────────────────────────────────────────────────────

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { user } = useAuthGuard('/dashboard');

  const [provider, setProvider] = useState<ProviderMini | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .get<ProviderMini>('/v1/providers/me')
      .then((p) => setProvider(p))
      .catch(() => {});
  }, [user]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  const pageTitle =
    PAGE_TITLE[pathname] ?? (pathname.startsWith('/dashboard/bookings/') ? 'Rezerwacje' : 'Panel');

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
            href="/dashboard/pricing"
            className={`${styles.navItem} ${isActive('/dashboard/pricing') ? styles.navActive : ''}`}
          >
            <IconPricing width="15" height="15" />
            Cennik
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
            href="/dashboard/hours"
            className={`${styles.navItem} ${isActive('/dashboard/hours') ? styles.navActive : ''}`}
          >
            <IconHours width="15" height="15" />
            Godziny pracy
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
        </nav>

        <div className={styles.footer}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{user?.phone?.slice(-2) ?? '??'}</div>
            <div className={styles.userInfo}>
              <Text variant="kicker" as="span" className={styles.userPhone}>
                {user?.phone}
              </Text>
              <Text variant="nano" as="span" className={styles.userRole}>
                {user?.role}
              </Text>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Wyloguj
          </button>
        </div>
      </aside>

      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <nav className={styles.breadcrumb} aria-label="Nawigacja strony">
          <span className={styles.breadcrumbItem}>Panel</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={`${styles.breadcrumbItem} ${styles.breadcrumbCurrent}`}>
            {pageTitle}
          </span>
        </nav>
        <div className={styles.topbarSpacer} />
        {provider && (
          <>
            <Text variant="body-sm" as="span" weight="bold" className={styles.firmName}>
              {provider.name}
            </Text>
            <Text
              variant="nano"
              as="span"
              className={`${styles.statusBadge} ${STATUS_CLASS[provider.status]}`}
            >
              {STATUS_LABEL[provider.status]}
            </Text>
          </>
        )}
      </header>
    </>
  );
}
