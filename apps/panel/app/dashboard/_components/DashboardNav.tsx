'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import {
  IconDashboard,
  IconBookings,
  IconPricing,
  IconHours,
  IconProfile,
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
  '/dashboard/hours': 'Godziny pracy',
  '/dashboard/pricing': 'Cennik',
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
    return pathname === href;
  }

  const pageTitle = PAGE_TITLE[pathname] ?? 'Panel';

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar} aria-label="Nawigacja główna">
        <div className={styles.brand}>
          <span className={styles.logo}>OPONY</span>
          <span className={styles.tag}>Panel</span>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navSection}>Dziś</span>
          <a
            href="/dashboard"
            className={`${styles.navItem} ${isActive('/dashboard') ? styles.navActive : ''}`}
          >
            <IconDashboard width="15" height="15" />
            Dashboard
          </a>
          <a
            href="/dashboard/bookings"
            className={`${styles.navItem} ${isActive('/dashboard/bookings') ? styles.navActive : ''}`}
          >
            <IconBookings width="15" height="15" />
            Rezerwacje
          </a>

          <span className={styles.navSection}>Warsztat</span>
          <a
            href="/dashboard/pricing"
            className={`${styles.navItem} ${isActive('/dashboard/pricing') ? styles.navActive : ''}`}
          >
            <IconPricing width="15" height="15" />
            Cennik
          </a>
          <a
            href="/dashboard/hours"
            className={`${styles.navItem} ${isActive('/dashboard/hours') ? styles.navActive : ''}`}
          >
            <IconHours width="15" height="15" />
            Godziny pracy
          </a>

          <span className={styles.navSection}>Konto</span>
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
              <span className={styles.userPhone}>{user?.phone}</span>
              <span className={styles.userRole}>{user?.role}</span>
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
            <span className={styles.firmName}>{provider.name}</span>
            <span className={`${styles.statusBadge} ${STATUS_CLASS[provider.status]}`}>
              {STATUS_LABEL[provider.status]}
            </span>
          </>
        )}
      </header>
    </>
  );
}
