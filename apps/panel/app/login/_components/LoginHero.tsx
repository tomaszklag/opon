import { Heading, Text } from '@opony/design-system-web';
import styles from '../login.module.css';

export function LoginHero() {
  return (
    <aside className={styles.heroSide} aria-label="Social proof">
      <div className={styles.otpPreview} aria-hidden="true">
        <div className={styles.otpPreviewLabel}>{'★ Krok 2 · po kliknięciu'}</div>
        <div className={styles.otpPreviewTitle}>WPROWADŹ KOD</div>
        <p className={styles.otpPreviewSub}>
          {'Wysłaliśmy 6-cyfrowy kod na '}
          <strong>+48 600 123 456</strong>
        </p>
        <div className={styles.otpCells}>
          {(['4', '8', '2', '_', '', ''] as const).map((v, i) => (
            <div
              key={i}
              className={[
                styles.otpCellPreview,
                v && v !== '_' ? styles.otpCellFilled : '',
                v === '_' ? styles.otpCellActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {v !== '_' ? v : ''}
            </div>
          ))}
        </div>
        <div className={styles.otpTimerRow}>
          <span>Wyślij ponownie</span>
          <span className={styles.otpTimerPill}>
            <span className={styles.miniDot} />
            01:48
          </span>
        </div>
      </div>

      <div className={styles.heroIntro}>
        <div className={styles.heroKicker}>Dla warsztatów — pilot Nowy Sącz</div>
        <Heading variant="hero" as="h2" className={styles.heroTitle}>
          ZARZĄDZAJ
          <br />
          REZERWACJAMI
          <br />Z <span className={styles.heroEm}>JEDNEGO</span>
          <br />
          MIEJSCA.
        </Heading>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCol}>
          <Heading variant="display-xl" as="span" className={styles.statVal}>
            <span className={styles.statEm}>23</span>
          </Heading>
          <Text variant="body-sm" as="span" className={styles.statLbl}>
            Warsztatów
            <br />w Nowym Sączu
          </Text>
        </div>
        <div className={styles.statCol}>
          <Heading variant="display-xl" as="span" className={styles.statVal}>
            1,2
            <Text variant="caption" as="span" className={styles.statSmall}>
              k
            </Text>
          </Heading>
          <Text variant="body-sm" as="span" className={styles.statLbl}>
            Rezerwacji
            <br />
            miesięcznie
          </Text>
        </div>
        <div className={styles.statCol}>
          <Heading variant="display-xl" as="span" className={styles.statVal}>
            4,8
            <Text variant="caption" as="span" className={styles.statSmall}>
              /5
            </Text>
          </Heading>
          <Text variant="body-sm" as="span" className={styles.statLbl}>
            Średnia ocen
            <br />w pilocie
          </Text>
        </div>
      </div>

      <blockquote className={styles.quoteCard}>
        <Text variant="body-sm" as="p" className={styles.quoteText}>
          {
            '„Zero telefonów przed sezonem. Klienci sami wybierają wolny slot, a ja rano otwieram pulpit i wiem co mnie czeka. Tego mi brakowało."'
          }
        </Text>
        <div className={styles.quoteAuthor}>
          <div className={styles.quoteAvatar}>PK</div>
          <div className={styles.quoteInfo}>
            <Text variant="body-sm" as="span" weight="bold" className={styles.quoteName}>
              Paweł Kępa
            </Text>
            <Text variant="kicker-sm" as="span" className={styles.quoteRole}>
              {'Wulkanizacja Kępa · N. Sącz · PILOT'}
            </Text>
          </div>
        </div>
      </blockquote>
    </aside>
  );
}
