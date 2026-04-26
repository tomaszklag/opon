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
        <h2 className={styles.heroTitle}>
          ZARZĄDZAJ
          <br />
          REZERWACJAMI
          <br />Z <span className={styles.heroEm}>JEDNEGO</span>
          <br />
          MIEJSCA.
        </h2>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCol}>
          <span className={styles.statVal}>
            <span className={styles.statEm}>23</span>
          </span>
          <span className={styles.statLbl}>
            Warsztatów
            <br />w Nowym Sączu
          </span>
        </div>
        <div className={styles.statCol}>
          <span className={styles.statVal}>
            1,2<span className={styles.statSmall}>k</span>
          </span>
          <span className={styles.statLbl}>
            Rezerwacji
            <br />
            miesięcznie
          </span>
        </div>
        <div className={styles.statCol}>
          <span className={styles.statVal}>
            4,8<span className={styles.statSmall}>/5</span>
          </span>
          <span className={styles.statLbl}>
            Średnia ocen
            <br />w pilocie
          </span>
        </div>
      </div>

      <blockquote className={styles.quoteCard}>
        <p className={styles.quoteText}>
          {
            '„Zero telefonów przed sezonem. Klienci sami wybierają wolny slot, a ja rano otwieram pulpit i wiem co mnie czeka. Tego mi brakowało."'
          }
        </p>
        <div className={styles.quoteAuthor}>
          <div className={styles.quoteAvatar}>PK</div>
          <div className={styles.quoteInfo}>
            <span className={styles.quoteName}>Paweł Kępa</span>
            <span className={styles.quoteRole}>{'Wulkanizacja Kępa · N. Sącz · PILOT'}</span>
          </div>
        </div>
      </blockquote>
    </aside>
  );
}
