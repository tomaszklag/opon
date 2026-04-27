import { PhoneInput } from '@opony/design-system-web';
import { Button } from '@opony/design-system-web';
import { IconArrowRight, IconHelp } from '../../../components/icons';
import styles from '../login.module.css';

interface Props {
  digits: string;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onDigitsChange: (val: string) => void;
}

export function PhoneStep({ digits, error, loading, onSubmit, onDigitsChange }: Props) {
  return (
    <form onSubmit={onSubmit} className={styles.formInner} noValidate>
      <div className={styles.kickerRow}>
        <span className={styles.kickerNum}>01 / 02</span>
        <span className={styles.kickerLabel}>Podaj numer telefonu</span>
      </div>

      <h1 className={styles.title} id="login-title">
        WITAJ
        <br />Z POWROTEM
      </h1>
      <p className={styles.subtitle}>
        Logujemy się jednym kodem SMS — <strong>bez haseł do zapamiętania</strong>. Użyj numeru,
        który podałeś podczas rejestracji warsztatu.
      </p>

      <PhoneInput
        label="Numer telefonu warsztatu"
        hint="Ten sam, co przy rejestracji"
        error={error || undefined}
        value={digits}
        onChange={(e) => onDigitsChange(e.target.value)}
        placeholder="600 000 000"
        autoComplete="tel"
        autoFocus
      />

      <Button
        type="submit"
        variant="cta"
        fullWidth
        loading={loading}
        disabled={digits.length !== 9}
      >
        WYŚLIJ KOD SMS
        {!loading && <IconArrowRight className={styles.arr} />}
      </Button>

      <div className={styles.altLinkRow}>
        <span className={styles.altText}>
          Nie masz jeszcze konta? <a href="/register">Załóż warsztat</a>
        </span>
        <a className={styles.helpLink} href="#">
          <IconHelp />
          Problem z logowaniem?
        </a>
      </div>
    </form>
  );
}
