import { type ProviderStatus } from '../../../lib/hooks/use-dashboard';
import styles from '../dashboard.module.css';

interface Props {
  status: ProviderStatus;
}

export function StatusBanners({ status }: Props) {
  if (status === 'PENDING') {
    return (
      <div className={styles.pendingBanner}>
        <strong>Firma oczekuje na weryfikację.</strong> Nasz zespół sprawdzi dane w ciągu 24 godzin.
        Po zatwierdzeniu Twoja firma pojawi się w wynikach wyszukiwania.
      </div>
    );
  }

  if (status === 'SUSPENDED') {
    return (
      <div className={styles.suspendedBanner}>
        <strong>Konto zawieszone.</strong> Skontaktuj się z nami pod adresem kontakt@opony.app, aby
        wyjaśnić sytuację.
      </div>
    );
  }

  return null;
}
