'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import styles from './dashboard.module.css';

type ProviderStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

interface Provider {
  id: string;
  name: string;
  status: ProviderStatus;
  city: string;
  voivodeship: string;
  phone: string;
  email?: string;
  nip: string;
  createdAt: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const { status, logout } = auth;
  const user = auth.status === 'authenticated' ? auth.user : null;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    api
      .get<Provider>('/v1/providers/me')
      .then(setProvider)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          router.replace('/register');
        }
      })
      .finally(() => setLoadingProvider(false));
  }, [status, router]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  if (status === 'loading' || loadingProvider) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className={styles.layout}>
      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar} aria-label="Nawigacja główna">
        <div className={styles.sidebarBrand}>
          <span className={styles.sidebarLogo}>OPONY</span>
          <span className={styles.sidebarTag}>Panel</span>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navSection}>Dziś</span>
          <a href="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>
            <IconDashboard />
            Dashboard
          </a>
          <a href="/dashboard/bookings" className={styles.navItem}>
            <IconBookings />
            Rezerwacje
          </a>

          <span className={styles.navSection}>Warsztat</span>
          <a href="/dashboard/pricing" className={styles.navItem}>
            <IconPricing />
            Cennik
          </a>
          <a href="/dashboard/hours" className={styles.navItem}>
            <IconHours />
            Godziny pracy
          </a>

          <span className={styles.navSection}>Konto</span>
          <a href="/dashboard/profile" className={styles.navItem}>
            <IconProfile />
            Profil firmy
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{user?.phone?.slice(-2) ?? '??'}</div>
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

      {/* ── MAIN ── */}
      <div className={styles.mainWrapper}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <nav className={styles.breadcrumb} aria-label="Nawigacja strony">
            <span className={styles.breadcrumbItem}>Panel</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={`${styles.breadcrumbItem} ${styles.breadcrumbCurrent}`}>
              Dashboard
            </span>
          </nav>
          <div className={styles.topbarSpacer} />
          <div className={styles.topbarFirmName}>{provider.name}</div>
          <span className={`${styles.statusBadge} ${STATUS_CLASS[provider.status]}`}>
            {STATUS_LABEL[provider.status]}
          </span>
        </header>

        {/* Content */}
        <main className={styles.main}>
          {provider.status === 'PENDING' && (
            <div className={styles.pendingBanner}>
              <strong>Firma oczekuje na weryfikację.</strong> Nasz zespół sprawdzi dane w ciągu 24
              godzin. Po zatwierdzeniu pojawi się w wynikach wyszukiwania.
            </div>
          )}

          {provider.status === 'SUSPENDED' && (
            <div className={styles.suspendedBanner}>
              <strong>Konto zawieszone.</strong> Skontaktuj się z nami pod adresem
              kontakt@opony.app, aby wyjaśnić sytuację.
            </div>
          )}

          <div className={styles.statsGrid}>
            <StatCard label="NIP" value={provider.nip} />
            <StatCard label="Telefon" value={provider.phone} />
            <StatCard label="Miasto" value={`${provider.city}, ${provider.voivodeship}`} />
            <StatCard label="Email" value={provider.email ?? '—'} />
          </div>

          <div className={styles.actionsGrid}>
            <ActionTile
              title="Godziny pracy"
              description="Ustaw dni i godziny, w których przyjmujesz klientów"
              href="/dashboard/hours"
              icon={<IconHours />}
              locked={provider.status !== 'APPROVED'}
            />
            <ActionTile
              title="Cennik"
              description="Zdefiniuj ceny wymiany opon według rozmiaru felgi"
              href="/dashboard/pricing"
              icon={<IconPricing />}
              locked={provider.status !== 'APPROVED'}
            />
            <ActionTile
              title="Rezerwacje"
              description="Przeglądaj nadchodzące wizyty klientów"
              href="/dashboard/bookings"
              icon={<IconBookings />}
              locked={provider.status !== 'APPROVED'}
            />
            <ActionTile
              title="Profil firmy"
              description="Edytuj dane kontaktowe i opis warsztatu"
              href="/dashboard/profile"
              icon={<IconProfile />}
              locked={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function ActionTile({
  title,
  description,
  href,
  icon,
  locked,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  locked: boolean;
}) {
  const router = useRouter();

  return (
    <button
      className={`${styles.actionTile} ${locked ? styles.actionTileLocked : ''}`}
      onClick={() => !locked && router.push(href)}
      disabled={locked}
      title={locked ? 'Dostępne po zatwierdzeniu konta' : undefined}
    >
      <span className={styles.actionIcon}>{icon}</span>
      <div className={styles.actionContent}>
        <div className={styles.actionTitle}>{title}</div>
        <div className={styles.actionDesc}>{description}</div>
      </div>
      {locked && (
        <svg
          className={styles.lockIcon}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
    </button>
  );
}
