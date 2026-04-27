import { OTPInput, Button, NoticeBlock } from '@opony/design-system-web';
import { IconArrowRight } from '../../../components/icons';
import styles from '../login.module.css';

interface Props {
  code: string;
  error: string;
  loading: boolean;
  otpCountdown: number;
  otpTimerLabel: string;
  isRateLimited: boolean;
  rateLimitTimerLabel: string;
  clientRoleError: boolean;
  phone: string;
  onSubmit: (e: React.FormEvent) => void;
  onCodeChange: (val: string) => void;
  onResend: () => void;
  onGoToPhone: () => void;
}

export function OtpStep({
  code,
  error,
  loading,
  otpCountdown,
  otpTimerLabel,
  isRateLimited,
  rateLimitTimerLabel,
  clientRoleError,
  phone,
  onSubmit,
  onCodeChange,
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

      <OTPInput length={6} value={code} onChange={onCodeChange} error={!!error} autoFocus />

      {error && <NoticeBlock variant="danger">{error}</NoticeBlock>}

      {clientRoleError && (
        <NoticeBlock variant="warning">
          To numer klienta. Aby otworzyć panel, <a href="/register">zarejestruj warsztat</a>.
        </NoticeBlock>
      )}

      {isRateLimited && (
        <NoticeBlock variant="warning" countdown={rateLimitTimerLabel}>
          Zbyt wiele prób. Spróbuj za
        </NoticeBlock>
      )}

      <Button
        type="submit"
        variant="cta"
        fullWidth
        loading={loading}
        disabled={code.length !== 6 || isRateLimited}
      >
        ZALOGUJ SIĘ
        {!loading && <IconArrowRight className={styles.arr} />}
      </Button>

      <div className={styles.timerRow}>
        {isRateLimited ? null : otpCountdown > 0 ? (
          <span className={styles.timerPill}>
            <span className={styles.timerDot} aria-hidden="true" />
            {otpTimerLabel}
          </span>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={onResend} disabled={loading}>
            Wyślij ponownie
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onGoToPhone}>
          Zmień numer
        </Button>
      </div>
    </form>
  );
}
