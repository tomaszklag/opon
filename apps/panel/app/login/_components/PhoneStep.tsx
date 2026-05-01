import { PhoneInput, Button, NoticeBlock, Heading, Text } from '@opony/design-system-web';
import { IconArrowRight, IconHelp } from '../../../components/icons';
import styles from '../login.module.css';

interface Props {
  digits: string;
  error: string;
  loading: boolean;
  phoneHint: 'none' | 'recognized' | 'not-registered';
  isRateLimited: boolean;
  rateLimitTimerLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onDigitsChange: (val: string) => void;
}

export function PhoneStep({
  digits,
  error,
  loading,
  phoneHint,
  isRateLimited,
  rateLimitTimerLabel,
  onSubmit,
  onDigitsChange,
}: Props) {
  return (
    <form onSubmit={onSubmit} className={styles.formInner} noValidate>
      <div className={styles.kickerRow}>
        <Text variant="kicker" as="span" className={styles.kickerNum}>
          01 / 02
        </Text>
        <Text variant="kicker" as="span" className={styles.kickerLabel}>
          Podaj numer telefonu
        </Text>
      </div>

      <Heading variant="display" as="h1" className={styles.title} id="login-title">
        WITAJ
        <br />Z POWROTEM
      </Heading>
      <Text variant="body-md" as="p" className={styles.subtitle}>
        Logujemy się jednym kodem SMS — <strong>bez haseł do zapamiętania</strong>. Użyj numeru,
        który podałeś podczas rejestracji warsztatu.
      </Text>

      <PhoneInput
        label="Numer telefonu warsztatu"
        hint="Ten sam, co przy rejestracji"
        error={error || undefined}
        notRegistered={phoneHint === 'not-registered'}
        value={digits}
        onChange={(e) => onDigitsChange(e.target.value)}
        placeholder="600 000 000"
        autoComplete="tel"
        autoFocus
        disabled={isRateLimited}
      />

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
        disabled={digits.length !== 9 || isRateLimited}
      >
        WYŚLIJ KOD SMS
        {!loading && <IconArrowRight className={styles.arr} />}
      </Button>

      <div className={styles.altLinkRow}>
        <Text variant="body-sm" as="span" className={styles.altText}>
          Nie masz jeszcze konta? <a href="/register">Załóż warsztat</a>
        </Text>
        <a className={styles.helpLink} href="#">
          <IconHelp />
          Problem z logowaniem?
        </a>
      </div>
    </form>
  );
}
