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

      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label className={styles.inputLabel} htmlFor="phone-field">
            Numer telefonu warsztatu
          </label>
          <span className={styles.inputHint}>Ten sam, co przy rejestracji</span>
        </div>
        <div className={styles.phoneInput}>
          <div className={styles.phonePrefix}>
            <span className={styles.flagPl} aria-hidden="true" />
            <span className={styles.prefixCode}>+48</span>
          </div>
          <input
            id="phone-field"
            className={styles.phoneField}
            type="tel"
            inputMode="numeric"
            placeholder="600 000 000"
            value={digits}
            onChange={(e) => onDigitsChange(e.target.value)}
            autoComplete="tel"
            autoFocus
          />
        </div>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <button
        type="submit"
        className={styles.ctaPrimary}
        disabled={loading || digits.length !== 9}
        aria-disabled={loading || digits.length !== 9}
      >
        {loading ? 'Wysyłanie…' : 'WYŚLIJ KOD SMS'}
        {!loading && <IconArrowRight className={styles.arr} />}
      </button>

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
