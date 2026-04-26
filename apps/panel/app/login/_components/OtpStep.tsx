import { type MutableRefObject } from 'react';
import { IconArrowRight } from '../../../components/icons';
import styles from '../login.module.css';

interface Props {
  cells: string[];
  error: string;
  loading: boolean;
  code: string;
  countdown: number;
  timerLabel: string;
  phone: string;
  otpRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  onSubmit: (e: React.FormEvent) => void;
  onCellChange: (idx: number, val: string) => void;
  onCellKeyDown: (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCellPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onResend: () => void;
  onGoToPhone: () => void;
}

export function OtpStep({
  cells,
  error,
  loading,
  code,
  countdown,
  timerLabel,
  phone,
  otpRefs,
  onSubmit,
  onCellChange,
  onCellKeyDown,
  onCellPaste,
  onResend,
  onGoToPhone,
}: Props) {
  return (
    <form onSubmit={onSubmit} className={styles.formInner} noValidate>
      <div className={styles.kickerRow}>
        <span className={styles.kickerNum}>02 / 02</span>
        <span className={styles.kickerLabel}>Wpisz kod z SMS</span>
      </div>

      <h1 className={styles.title} id="login-title">
        WPISZ
        <br />
        KOD SMS
      </h1>
      <p className={styles.subtitle}>
        {'Wysłaliśmy 6-cyfrowy kod na '}
        <strong>{phone}</strong>. Kod jest ważny przez 5 minut.
      </p>

      <div className={styles.otpGrid} role="group" aria-label="Kod weryfikacyjny — 6 cyfr">
        {cells.map((val, idx) => (
          <input
            key={idx}
            ref={(el) => {
              otpRefs.current[idx] = el;
            }}
            className={[styles.otpCell, val ? styles.otpCellFilled : ''].join(' ')}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => onCellChange(idx, e.target.value)}
            onKeyDown={(e) => onCellKeyDown(idx, e)}
            onPaste={idx === 0 ? onCellPaste : undefined}
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            aria-label={`Cyfra ${idx + 1} z 6`}
          />
        ))}
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <button
        type="submit"
        className={styles.ctaPrimary}
        disabled={loading || code.length !== 6}
        aria-disabled={loading || code.length !== 6}
      >
        {loading ? 'Weryfikacja…' : 'ZALOGUJ SIĘ'}
        {!loading && <IconArrowRight className={styles.arr} />}
      </button>

      <div className={styles.timerRow}>
        {countdown > 0 ? (
          <span className={styles.timerPill}>
            <span className={styles.timerDot} aria-hidden="true" />
            {timerLabel}
          </span>
        ) : (
          <button type="button" className={styles.linkBtn} onClick={onResend} disabled={loading}>
            Wyślij ponownie
          </button>
        )}
        <button type="button" className={styles.linkBtn} onClick={onGoToPhone}>
          Zmień numer
        </button>
      </div>
    </form>
  );
}
