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
}

const STATUS_LABEL: Record<ProviderStatus, string> = {
  PENDING: 'Oczekuje na weryfikację',
  APPROVED: 'Aktywna',
  SUSPENDED: 'Zawieszona',
};

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    api
      .get<Provider>('/v1/providers/me')
      .then(setProvider)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) router.replace('/register');
      })
      .finally(() => setLoading(false));
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className={styles.page}>
      {provider.status === 'PENDING' && (
        <div className={styles.pendingBanner}>
          <strong>Firma oczekuje na weryfikację.</strong> Nasz zespół sprawdzi dane w ciągu 24
          godzin. Po zatwierdzeniu Twoja firma pojawi się w wynikach wyszukiwania.
        </div>
      )}
      {provider.status === 'SUSPENDED' && (
        <div className={styles.suspendedBanner}>
          <strong>Konto zawieszone.</strong> Skontaktuj się z nami pod adresem kontakt@opony.app,
          aby wyjaśnić sytuację.
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard label="NIP" value={provider.nip} />
        <StatCard label="Telefon" value={provider.phone} />
        <StatCard label="Miasto" value={`${provider.city}, ${provider.voivodeship}`} />
        <StatCard label="Status" value={STATUS_LABEL[provider.status]} />
      </div>

      <div className={styles.actionsGrid}>
        <ActionTile
          title="Godziny pracy"
          description="Ustaw dni i godziny, w których przyjmujesz klientów"
          href="/dashboard/hours"
          locked={provider.status !== 'APPROVED'}
        />
        <ActionTile
          title="Cennik"
          description="Zdefiniuj ceny wymiany opon według rozmiaru felgi"
          href="/dashboard/pricing"
          locked={provider.status !== 'APPROVED'}
        />
        <ActionTile
          title="Rezerwacje"
          description="Przeglądaj nadchodzące wizyty klientów"
          href="/dashboard/bookings"
          locked={provider.status !== 'APPROVED'}
        />
        <ActionTile
          title="Profil firmy"
          description="Edytuj dane kontaktowe i opis warsztatu"
          href="/dashboard/profile"
          locked={false}
        />
      </div>
    </div>
  );
}

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
  locked,
}: {
  title: string;
  description: string;
  href: string;
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
      <div className={styles.actionContent}>
        <div className={styles.actionTitle}>{title}</div>
        <div className={styles.actionDesc}>{description}</div>
      </div>
      {locked && (
        <svg
          className={styles.lockIcon}
          width="13"
          height="13"
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
