'use client';

import { useLoginFlow } from '../../lib/hooks/use-login-flow';
import { IconArrowRight, IconHelp, IconLock, IconShield } from '../../components/icons';
import styles from './login.module.css';

export default function LoginPage() {
  const {
    step,
    digits,
    cells,
    error,
    loading,
    countdown,
    otpRefs,
    phone,
    code,
    timerLabel,
    authLoading,
    handleDigitsChange,
    handlePhoneSubmit,
    handleOtpSubmit,
    handleResend,
    handleCellChange,
    handleCellKeyDown,
    handleCellPaste,
    goToPhone,
  } = useLoginFlow();

  if (authLoading) return null;

  return (
    <div className={styles.page}>
      {/* ── FORM SIDE ── */}
      <section className={styles.formSide} aria-labelledby="login-title">
        <div className={styles.brandRow}>
          <span className={styles.wordmark}>
            OPONY
            <span className={styles.dot} aria-hidden="true" />
          </span>
          <span className={styles.panelTag}>Panel warsztatu</span>
        </div>

        <div className={styles.formFrame}>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className={styles.formInner} noValidate>
              <div className={styles.kickerRow}>
                <span className={styles.kickerNum}>01 / 02</span>
                <span className={styles.kickerLabel}>Podaj numer telefonu</span>
              </div>

              <h1 className={styles.title} id="login-title">
                WITAJ
                <br />Z POWROTEM
              </h1>
              <p className={styles.subtitle}>
                Logujemy się jednym kodem SMS — <strong>bez haseł do zapamiętania</strong>. Użyj
                numeru, który podałeś podczas rejestracji warsztatu.
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
                    onChange={(e) => handleDigitsChange(e.target.value)}
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
          ) : (
            <form onSubmit={handleOtpSubmit} className={styles.formInner} noValidate>
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
                    onChange={(e) => handleCellChange(idx, e.target.value)}
                    onKeyDown={(e) => handleCellKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleCellPaste : undefined}
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
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={handleResend}
                    disabled={loading}
                  >
                    Wyślij ponownie
                  </button>
                )}
                <button type="button" className={styles.linkBtn} onClick={goToPhone}>
                  Zmień numer
                </button>
              </div>
            </form>
          )}
        </div>

        <footer className={styles.formFooter}>
          <div className={styles.legalRow}>
            <a href="#">Regulamin</a>
            <span className={styles.legalSep}>·</span>
            <a href="#">Polityka prywatności</a>
            <span className={styles.legalSep}>·</span>
            <a href="#">RODO</a>
          </div>
          <div className={styles.trustCluster}>
            <span className={styles.trustBadge}>
              <IconLock className={styles.badgeIco} />
              TLS 1.3
            </span>
            <span className={styles.trustBadge}>
              <IconShield className={styles.badgeIco} />
              RODO
            </span>
          </div>
        </footer>
      </section>

      {/* ── HERO SIDE ── */}
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
    </div>
  );
}
