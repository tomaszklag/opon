'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
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

// ── SVG icons ──────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);
const IconBookings = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 11H5a2 2 0 0 0-2 2v7h18v-7a2 2 0 0 0-2-2h-4M9 11V5a3 3 0 0 1 6 0v6M9 11h6" />
  </svg>
);
const IconPricing = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconHours = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const IconProfile = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { status, logout } = auth;
  const user = auth.status === 'authenticated' ? auth.user : null;

  const [provider, setProvider] = useState<ProviderMini | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (status !== 'authenticated') return;

    api
      .get<ProviderMini>('/v1/providers/me')
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          router.replace('/register');
        }
      })
      .then((p) => {
        if (p) setProvider(p);
      });
  }, [status, router]);

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
            <IconDashboard />
            Dashboard
          </a>
          <a
            href="/dashboard/bookings"
            className={`${styles.navItem} ${isActive('/dashboard/bookings') ? styles.navActive : ''}`}
          >
            <IconBookings />
            Rezerwacje
          </a>

          <span className={styles.navSection}>Warsztat</span>
          <a
            href="/dashboard/pricing"
            className={`${styles.navItem} ${isActive('/dashboard/pricing') ? styles.navActive : ''}`}
          >
            <IconPricing />
            Cennik
          </a>
          <a
            href="/dashboard/hours"
            className={`${styles.navItem} ${isActive('/dashboard/hours') ? styles.navActive : ''}`}
          >
            <IconHours />
            Godziny pracy
          </a>

          <span className={styles.navSection}>Konto</span>
          <a
            href="/dashboard/profile"
            className={`${styles.navItem} ${isActive('/dashboard/profile') ? styles.navActive : ''}`}
          >
            <IconProfile />
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
