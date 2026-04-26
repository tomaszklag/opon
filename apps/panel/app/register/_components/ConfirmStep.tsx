import { Button } from '@opony/design-system-web';
import { type FirmData } from '../../../lib/hooks/use-register-flow';
import styles from '../register.module.css';

interface Props {
  data: FirmData;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoBack: () => void;
}

export function ConfirmStep({ data, error, loading, onSubmit, onGoBack }: Props) {
  return (
    <>
      <h1 className={styles.title}>Sprawdź dane</h1>
      <p className={styles.subtitle}>Upewnij się, że wszystko się zgadza przed wysłaniem</p>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Firma</span>
          <span className={styles.summaryValue}>{data.name}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>NIP</span>
          <span className={styles.summaryValue}>{data.nip}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Telefon</span>
          <span className={styles.summaryValue}>{data.phone}</span>
        </div>
        {data.email && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>E-mail</span>
            <span className={styles.summaryValue}>{data.email}</span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Adres</span>
          <span className={styles.summaryValue}>
            {data.street}, {data.postalCode} {data.city}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Województwo</span>
          <span className={styles.summaryValue}>{data.voivodeship}</span>
        </div>
        {data.description && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Opis</span>
            <span className={styles.summaryValue}>{data.description}</span>
          </div>
        )}
      </div>

      <div className={styles.notice}>
        Po rejestracji firma będzie oczekiwać na weryfikację przez nasz zespół. Zazwyczaj trwa to do
        24 godzin.
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={onSubmit} className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onGoBack} disabled={loading}>
          ← Wróć i edytuj
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Zarejestruj firmę
        </Button>
      </form>
    </>
  );
}
