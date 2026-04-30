'use client';

import { useDashboard, STATUS_LABEL } from '../../lib/hooks/use-dashboard';
import { StatusBanners } from './_components/StatusBanners';
import { StatCard } from './_components/StatCard';
import { ActionTile } from './_components/ActionTile';
import { WaitingForClients } from './_components/WaitingForClients';
import styles from './dashboard.module.css';

const CLIENT_LAUNCH_DATE = new Date(process.env.NEXT_PUBLIC_CLIENT_LAUNCH_DATE ?? '2026-05-14');

export default function DashboardPage() {
  const { provider, loading, authLoading } = useDashboard();

  if (authLoading || loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!provider) return null;

  // TODO: dodać warunek bookingCount === 0 (ADR-009) — wymaga endpointu /v1/bookings?limit=1
  // Fallback do normalnego dashboardu nastąpi automatycznie po minięciu CLIENT_LAUNCH_DATE.
  if (provider.status === 'APPROVED' && new Date() < CLIENT_LAUNCH_DATE) {
    return <WaitingForClients launchDate={CLIENT_LAUNCH_DATE} />;
  }

  const locked = provider.status !== 'APPROVED';

  return (
    <div className={styles.page}>
      <StatusBanners status={provider.status} />

      <div className={styles.statsGrid}>
        <StatCard label="NIP" value={provider.nip} />
        <StatCard label="Telefon" value={provider.phone ?? '—'} />
        <StatCard label="Typ" value={provider.type === 'MOBILE' ? 'Mobilny' : 'Stacjonarny'} />
        <StatCard label="Status" value={STATUS_LABEL[provider.status]} />
      </div>

      <div className={styles.actionsGrid}>
        <ActionTile
          title="Godziny pracy"
          description="Ustaw dni i godziny, w których przyjmujesz klientów"
          href="/dashboard/hours"
          locked={locked}
        />
        <ActionTile
          title="Cennik"
          description="Zdefiniuj ceny wymiany opon według rozmiaru felgi"
          href="/dashboard/pricing"
          locked={locked}
        />
        <ActionTile
          title="Rezerwacje"
          description="Przeglądaj nadchodzące wizyty klientów"
          href="/dashboard/bookings"
          locked={locked}
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
