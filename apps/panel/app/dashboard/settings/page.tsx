'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Heading, Text, Toggle } from '@opony/design-system-web';
import {
  IconAlertTriangle,
  IconBell,
  IconCheck,
  IconDownload,
  IconEyeOff,
  IconHours,
  IconInfo,
  IconLogOut,
  IconMail,
  IconMobilePhone,
  IconPause,
  IconPencil,
  IconSMS,
  IconStations,
  IconTrash,
} from '../../../components/icons';
import { usePause } from '../../../lib/hooks/use-pause';
import styles from './settings.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

type NotifKey =
  | 'newBooking'
  | 'cancelation'
  | 'reminder30'
  | 'newReview'
  | 'weeklyReport'
  | 'platformNews';
type Channel = 'sms' | 'email' | 'push';
type NotifState = Record<NotifKey, Record<Channel, boolean>>;

const SECTION_IDS = ['contact', 'pause', 'notifs', 'sessions', 'rodo', 'danger'] as const;

const NOTIF_INITIAL: NotifState = {
  newBooking: { sms: true, email: false, push: true },
  cancelation: { sms: true, email: false, push: true },
  reminder30: { sms: true, email: false, push: true },
  newReview: { sms: false, email: true, push: true },
  weeklyReport: { sms: false, email: true, push: false },
  platformNews: { sms: false, email: false, push: false },
};

const PUSH_DISABLED = new Set<NotifKey>(['weeklyReport', 'platformNews']);
const CRITICAL = new Set<NotifKey>(['newBooking', 'cancelation']);

const NOTIF_ROWS: { key: NotifKey; title: string; desc: string }[] = [
  {
    key: 'newBooking',
    title: 'Nowa rezerwacja',
    desc: 'Klient umawia wizytę · status PENDING, wymaga potwierdzenia w 15 min.',
  },
  {
    key: 'cancelation',
    title: 'Anulowanie rezerwacji',
    desc: 'Klient anuluje — potrzebujesz wiedzieć, żeby slot wrócił do puli.',
  },
  {
    key: 'reminder30',
    title: 'Przypomnienie 30 min przed wizytą',
    desc: 'Pomoc w planowaniu dnia — wysyłane tylko w godzinach pracy.',
  },
  {
    key: 'newReview',
    title: 'Nowa opinia od klienta',
    desc: 'Szybka odpowiedź do 48h zwiększa ranking warsztatu.',
  },
  {
    key: 'weeklyReport',
    title: 'Raport tygodniowy',
    desc: 'Podsumowanie rezerwacji, przychodu i opinii · poniedziałek rano.',
  },
  {
    key: 'platformNews',
    title: 'Nowości w platformie',
    desc: 'Zmiany w panelu, nowe funkcje, zaproszenia na webinary.',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>('contact');
  const [notifs, setNotifs] = useState<NotifState>(NOTIF_INITIAL);
  const {
    isPaused,
    pausedUntil,
    applying,
    error: pauseError,
    pauseToday,
    pauseWeekend,
    pauseWeek,
    unpause,
  } = usePause();

  // Scroll-spy via IntersectionObserver on the scrollable body div
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id.replace('sec-', ''));
        });
      },
      { root, threshold: 0.2 },
    );
    SECTION_IDS.forEach((id) => {
      const el = root.querySelector(`#sec-${id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  function scrollToSection(id: string) {
    bodyRef.current
      ?.querySelector(`#sec-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleNotif(key: NotifKey, channel: Channel) {
    setNotifs((prev) => {
      const curr = prev[key];
      const newVal = !curr[channel];
      if (CRITICAL.has(key) && !newVal) {
        const otherOn = (Object.keys(curr) as Channel[])
          .filter((c) => c !== channel)
          .some((c) => curr[c]);
        if (!otherOn) return prev;
      }
      return { ...prev, [key]: { ...curr, [channel]: newVal } };
    });
  }

  // ── TOC ────────────────────────────────────────────────────────────────────

  const tocItems = [
    { id: 'contact', num: '01', label: 'Kontakt administracyjny', danger: false },
    { id: 'pause', num: '02', label: 'Pauza warsztatu', danger: false },
    { id: 'notifs', num: '03', label: 'Powiadomienia', danger: false },
    { id: 'sessions', num: '04', label: 'Aktywne sesje', danger: false },
    { id: 'rodo', num: '05', label: 'Dane (RODO)', danger: false },
    { id: 'danger', num: '06', label: 'Strefa niebezpieczna', danger: true },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.root}>
      {/* Topbar */}
      <div className={styles.topbar}>
        <nav className={styles.breadcrumb} aria-label="Nawigacja strony">
          <Text variant="body-sm" as="span" color="muted" weight="semibold">
            Firma
          </Text>
          <Text variant="body-sm" as="span" color="muted">
            ›
          </Text>
          <Text variant="body-sm" as="span" weight="bold">
            Ustawienia konta
          </Text>
        </nav>
        <div className={styles.topbarSpacer} />
        <span className={styles.versionPill}>
          <Text variant="nano" as="span" color="muted" mono>
            Panel{' '}
            <Text variant="nano" as="span" weight="bold" mono>
              v0.1.0
            </Text>{' '}
            · pilot Nowy Sącz
          </Text>
        </span>
      </div>

      {/* Content split */}
      <div className={styles.contentSplit}>
        {/* TOC */}
        <nav className={styles.toc} aria-label="Spis treści ustawień">
          <Text variant="nano" as="span" weight="bold" color="muted" className={styles.tocLabel}>
            Sekcje
          </Text>
          {tocItems.map(({ id, num, label, danger }) => (
            <button
              key={id}
              type="button"
              className={[
                styles.tocItem,
                activeSection === id ? styles.tocActive : '',
                danger ? styles.tocDanger : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => scrollToSection(id)}
            >
              <Text variant="nano" as="span" mono className={styles.tocNum}>
                {num}
              </Text>
              {label}
            </button>
          ))}
        </nav>

        {/* Scrollable body */}
        <div className={styles.bodyScroll} ref={bodyRef}>
          {/* ── 01 Kontakt administracyjny ────────────────────────────────── */}
          <section id="sec-contact" className={styles.section} aria-labelledby="t-contact">
            <header className={styles.secHead}>
              <Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
                01
              </Text>
              <div className={styles.secTitleCol}>
                <Heading variant="subsection" as="h2" id="t-contact">
                  Kontakt administracyjny
                </Heading>
                <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                  Numer telefonu służy do logowania (SMS OTP). Email otrzymuje paragony i
                  powiadomienia administracyjne — nie jest widoczny publicznie.
                </Text>
              </div>
              <span className={styles.secKicker}>
                <Text variant="nano" as="span" weight="bold" mono color="muted">
                  US-47
                </Text>
              </span>
            </header>

            <div className={styles.contactRow}>
              {/* Phone card */}
              <div className={styles.contactCard}>
                <div className={styles.contactLbl}>
                  <Text variant="nano" as="span" color="muted" weight="bold" mono>
                    Telefon · login
                  </Text>
                  <span className={styles.verified}>
                    <IconCheck width="9" height="9" />
                    <Text variant="nano" as="span">
                      Zweryfikowany
                    </Text>
                  </span>
                </div>
                <div className={styles.contactValRow}>
                  <Text variant="body" as="span" weight="bold" mono className={styles.contactVal}>
                    +48 600 123 456
                  </Text>
                  <Button variant="neutral" size="sm">
                    <IconPencil width="11" height="11" />
                    Zmień
                  </Button>
                </div>
                <Text variant="caption" color="muted" as="p">
                  Zmiana wymaga OTP na stary numer, a następnie OTP na nowy. Sesja pozostanie
                  aktywna.
                </Text>
              </div>

              {/* Email card */}
              <div className={styles.contactCard}>
                <div className={styles.contactLbl}>
                  <Text variant="nano" as="span" color="muted" weight="bold" mono>
                    Email · administracyjny
                  </Text>
                  <span className={styles.verified}>
                    <IconCheck width="9" height="9" />
                    <Text variant="nano" as="span">
                      OK
                    </Text>
                  </span>
                </div>
                <div className={styles.contactValRow}>
                  <Text
                    variant="body-sm"
                    as="span"
                    weight="bold"
                    mono
                    className={styles.contactVal}
                  >
                    jan.kowalski@example.pl
                  </Text>
                  <Button variant="neutral" size="sm">
                    <IconPencil width="11" height="11" />
                    Zmień
                  </Button>
                </div>
                <Text variant="caption" color="muted" as="p">
                  Tu trafiają paragony za usługę Opony (w v0 pilot —{' '}
                  <Text variant="caption" as="span" weight="bold">
                    0 zł
                  </Text>
                  , w v0.5 planowana prowizja).
                </Text>
              </div>
            </div>
          </section>

          {/* ── 02 Pauza warsztatu ───────────────────────────────────────── */}
          <section
            id="sec-pause"
            className={`${styles.section} ${styles.sectionAccent}`}
            aria-labelledby="t-pause"
          >
            <header className={styles.secHead}>
              <Text
                variant="nano"
                as="span"
                weight="extrabold"
                mono
                className={`${styles.secNum} ${styles.secNumAccent}`}
              >
                02
              </Text>
              <div className={styles.secTitleCol}>
                <Heading variant="subsection" as="h2" id="t-pause">
                  Pauza warsztatu
                </Heading>
                <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                  Włącz, gdy jedziesz na urlop albo przyjmujesz awarie &quot;off-book&quot;.
                  Warsztat znika z wyszukiwarki klientów, ale istniejące rezerwacje są zachowane.
                </Text>
              </div>
              <span className={styles.secKicker}>
                <Text variant="nano" as="span" weight="bold" mono color="muted">
                  Natychmiastowe
                </Text>
              </span>
            </header>

            {/* Pause hero */}
            <div className={styles.pauseHero}>
              <span className={styles.pauseIco} aria-hidden="true">
                <IconHours width="24" height="24" />
              </span>
              <div className={styles.pauseStatusCol}>
                <Heading variant="subsection" as="span">
                  {isPaused ? 'WARSZTAT ZAPAUZOWANY' : 'WARSZTAT AKTYWNY'}
                </Heading>
                {isPaused && pausedUntil ? (
                  <Text variant="body-sm" color="secondary" as="span">
                    Niewidoczny w wyszukiwarce. Pauza do:{' '}
                    <Text variant="body-sm" as="span" weight="bold">
                      {new Date(pausedUntil).toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                    .
                  </Text>
                ) : (
                  <Text variant="body-sm" color="secondary" as="span">
                    Widoczny w wyszukiwarce. Klienci mogą składać rezerwacje.
                  </Text>
                )}
              </div>
              {isPaused ? (
                <Button variant="primary" size="sm" onClick={unpause} loading={applying}>
                  Odblokuj warsztat
                </Button>
              ) : (
                <Button variant="neutral" size="sm" onClick={pauseToday} loading={applying}>
                  <IconPause width="13" height="13" />
                  Zapauzuj teraz
                </Button>
              )}
            </div>

            {pauseError && (
              <Text variant="body-sm" as="p" color="danger">
                {pauseError}
              </Text>
            )}

            {/* Pause presets */}
            {!isPaused && (
              <div className={styles.pausePresets}>
                <button
                  type="button"
                  className={styles.pausePreset}
                  onClick={pauseToday}
                  disabled={applying}
                >
                  <Text variant="nano" as="span" color="muted" weight="bold" mono>
                    Preset
                  </Text>
                  <Heading variant="subsection" as="span">
                    Dziś
                  </Heading>
                  <Text variant="nano" as="span" color="muted">
                    Do końca dnia · 23:59
                  </Text>
                </button>
                <button
                  type="button"
                  className={styles.pausePreset}
                  onClick={pauseWeekend}
                  disabled={applying}
                >
                  <Text variant="nano" as="span" color="muted" weight="bold" mono>
                    Preset
                  </Text>
                  <Heading variant="subsection" as="span">
                    Weekend
                  </Heading>
                  <Text variant="nano" as="span" color="muted">
                    Do najbliższego poniedziałku
                  </Text>
                </button>
                <button
                  type="button"
                  className={styles.pausePreset}
                  onClick={pauseWeek}
                  disabled={applying}
                >
                  <Text variant="nano" as="span" color="muted" weight="bold" mono>
                    Preset
                  </Text>
                  <Heading variant="subsection" as="span">
                    Tydzień
                  </Heading>
                  <Text variant="nano" as="span" color="muted">
                    7 dni od teraz
                  </Text>
                </button>
              </div>
            )}
          </section>

          {/* ── 03 Powiadomienia ─────────────────────────────────────────── */}
          <section id="sec-notifs" className={styles.section} aria-labelledby="t-notifs">
            <header className={styles.secHead}>
              <Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
                03
              </Text>
              <div className={styles.secTitleCol}>
                <Heading variant="subsection" as="h2" id="t-notifs">
                  Powiadomienia
                </Heading>
                <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                  Wybierz kanały per typ zdarzenia. Krytyczne powiadomienia (✦) wymagają co najmniej
                  jednego aktywnego kanału — tego nie wyłączysz całkowicie.
                </Text>
              </div>
            </header>

            <table className={styles.notifTable} aria-label="Kanały powiadomień">
              <thead>
                <tr>
                  <th className={styles.notifTh}>
                    <Text variant="nano" as="span" weight="bold" mono color="muted">
                      Zdarzenie
                    </Text>
                  </th>
                  <th className={`${styles.notifTh} ${styles.notifThChannel}`}>
                    <span className={styles.channelIco}>
                      <IconSMS width="11" height="11" />
                    </span>
                    <Text variant="nano" as="span" weight="bold" mono color="muted">
                      SMS
                    </Text>
                  </th>
                  <th className={`${styles.notifTh} ${styles.notifThChannel}`}>
                    <span className={styles.channelIco}>
                      <IconMail width="11" height="11" />
                    </span>
                    <Text variant="nano" as="span" weight="bold" mono color="muted">
                      Email
                    </Text>
                  </th>
                  <th className={`${styles.notifTh} ${styles.notifThChannel}`}>
                    <span className={styles.channelIco}>
                      <IconBell width="11" height="11" />
                    </span>
                    <Text variant="nano" as="span" weight="bold" mono color="muted">
                      Push
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {NOTIF_ROWS.map(({ key, title, desc }) => (
                  <tr key={key} className={styles.notifTr}>
                    <td className={styles.notifTd}>
                      <div className={styles.notifEvent}>
                        <Text variant="body-sm" as="span" weight="bold">
                          {CRITICAL.has(key) && (
                            <span className={styles.criticalBadge}>
                              <Text variant="nano" as="span" weight="bold" mono color="accent">
                                ✦ KRYT.
                              </Text>
                            </span>
                          )}
                          {title}
                        </Text>
                        <Text variant="caption" color="muted" as="span">
                          {desc}
                        </Text>
                      </div>
                    </td>
                    {(['sms', 'email', 'push'] as Channel[]).map((ch) => {
                      const isDisabled = ch === 'push' && PUSH_DISABLED.has(key);
                      return (
                        <td key={ch} className={styles.switchCell}>
                          <div className={styles.switchWrap}>
                            <Toggle
                              size="sm"
                              checked={notifs[key][ch]}
                              onChange={() => !isDisabled && toggleNotif(key, ch)}
                              disabled={isDisabled}
                              aria-label={`${ch} ${title}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── 04 Aktywne sesje ─────────────────────────────────────────── */}
          <section id="sec-sessions" className={styles.section} aria-labelledby="t-sessions">
            <header className={styles.secHead}>
              <Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
                04
              </Text>
              <div className={styles.secTitleCol}>
                <Heading variant="subsection" as="h2" id="t-sessions">
                  Aktywne sesje
                </Heading>
                <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                  Urządzenia zalogowane do panelu. Nie widzisz czegoś swojego? Wyloguj wszystkie i
                  zmień numer telefonu.
                </Text>
              </div>
            </header>

            <div className={styles.sessionList}>
              {/* Current session */}
              <div className={`${styles.sessionItem} ${styles.sessionCurrent}`}>
                <span className={`${styles.sessionIco} ${styles.sessionIcoCurrent}`}>
                  <IconStations width="16" height="16" />
                </span>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionMain}>
                    <Text variant="body-sm" as="span" weight="bold">
                      Chrome 126 · macOS
                    </Text>
                    <span className={styles.sessionCurrentBadge}>
                      <Text variant="nano" as="span" weight="bold" mono>
                        TA SESJA
                      </Text>
                    </span>
                  </div>
                  <div className={styles.sessionMeta}>
                    <Text variant="nano" as="span" color="muted" mono>
                      Nowy Sącz · 185.254.xxx.xxx
                    </Text>
                    <span className={styles.dotSep} aria-hidden="true" />
                    <Text variant="nano" as="span" color="muted" mono>
                      Zalogowano dziś · 09:42
                    </Text>
                    <span className={styles.dotSep} aria-hidden="true" />
                    <Text variant="nano" as="span" color="muted" mono>
                      Aktywna teraz
                    </Text>
                  </div>
                </div>
              </div>

              {/* Safari / iPhone */}
              <div className={styles.sessionItem}>
                <span className={styles.sessionIco}>
                  <IconMobilePhone width="16" height="16" />
                </span>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionMain}>
                    <Text variant="body-sm" as="span" weight="bold">
                      Safari 17 · iPhone 14
                    </Text>
                  </div>
                  <div className={styles.sessionMeta}>
                    <Text variant="nano" as="span" color="muted" mono>
                      Nowy Sącz
                    </Text>
                    <span className={styles.dotSep} aria-hidden="true" />
                    <Text variant="nano" as="span" color="muted" mono>
                      Zalogowano 14 kwie · 17:18
                    </Text>
                    <span className={styles.dotSep} aria-hidden="true" />
                    <Text variant="nano" as="span" color="muted" mono>
                      Aktywna · 2 godz temu
                    </Text>
                  </div>
                </div>
                <Button variant="neutral-danger" size="sm">
                  <IconLogOut width="12" height="12" />
                  Wyloguj
                </Button>
              </div>

              {/* Firefox / Windows */}
              <div className={styles.sessionItem}>
                <span className={styles.sessionIco}>
                  <IconStations width="16" height="16" />
                </span>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionMain}>
                    <Text variant="body-sm" as="span" weight="bold">
                      Firefox 125 · Windows 11
                    </Text>
                  </div>
                  <div className={styles.sessionMeta}>
                    <Text variant="nano" as="span" color="muted" mono>
                      Kraków · 31.0.xxx.xxx
                    </Text>
                    <span className={styles.dotSep} aria-hidden="true" />
                    <Text variant="nano" as="span" color="muted" mono>
                      Zalogowano 02 kwie · 11:05
                    </Text>
                    <span className={styles.dotSep} aria-hidden="true" />
                    <Text variant="nano" as="span" color="warning" mono>
                      Nieaktywna · 8 dni
                    </Text>
                  </div>
                </div>
                <Button variant="neutral-danger" size="sm">
                  <IconLogOut width="12" height="12" />
                  Wyloguj
                </Button>
              </div>

              <div className={styles.sessionLogoutAll}>
                <Button variant="neutral-danger" size="sm">
                  <IconLogOut width="12" height="12" />
                  Wyloguj wszystkie inne urządzenia (2)
                </Button>
              </div>
            </div>
          </section>

          {/* ── 05 Dane RODO ─────────────────────────────────────────────── */}
          <section id="sec-rodo" className={styles.section} aria-labelledby="t-rodo">
            <header className={styles.secHead}>
              <Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
                05
              </Text>
              <div className={styles.secTitleCol}>
                <Heading variant="subsection" as="h2" id="t-rodo">
                  Twoje dane (RODO)
                </Heading>
                <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                  Masz prawo otrzymać kopię swoich danych i wiedzieć, co o Tobie wiemy.
                </Text>
              </div>
              <span className={styles.secKicker}>
                <Text variant="nano" as="span" weight="bold" mono color="muted">
                  US-46
                </Text>
              </span>
            </header>

            <div className={styles.rodoRow}>
              <div className={styles.rodoCard}>
                <span className={styles.rodoIco}>
                  <IconDownload width="15" height="15" />
                </span>
                <div className={styles.rodoCol}>
                  <Text variant="body-sm" as="span" weight="bold">
                    Pobierz moje dane
                  </Text>
                  <Text variant="caption" color="muted" as="p">
                    Wyślemy paczkę ZIP (JSON + PDF) na email administracyjny w ciągu 14 dni.
                    Zawiera: profil firmy, rezerwacje, opinie, logi logowania.
                  </Text>
                </div>
                <Button variant="neutral" size="sm">
                  Zamów
                </Button>
              </div>

              <div className={styles.rodoCard}>
                <span className={styles.rodoIco}>
                  <IconInfo width="15" height="15" />
                </span>
                <div className={styles.rodoCol}>
                  <Text variant="body-sm" as="span" weight="bold">
                    Zgłoś nieprawidłowość
                  </Text>
                  <Text variant="caption" color="muted" as="p">
                    Jeśli widzisz dane, których nie powinno być — napisz do{' '}
                    <Text variant="caption" as="span" weight="bold">
                      rodo@opony.app
                    </Text>
                    . Odpowiadamy do 72h zgodnie z art. 12 RODO.
                  </Text>
                </div>
                <Button variant="neutral" size="sm">
                  Napisz
                </Button>
              </div>
            </div>
          </section>

          {/* ── 06 Strefa niebezpieczna ──────────────────────────────────── */}
          <section
            id="sec-danger"
            className={`${styles.section} ${styles.sectionDanger}`}
            aria-labelledby="t-danger"
          >
            <header className={styles.secHead}>
              <Text
                variant="nano"
                as="span"
                weight="extrabold"
                mono
                className={`${styles.secNum} ${styles.secNumDanger}`}
              >
                06
              </Text>
              <div className={styles.secTitleCol}>
                <Heading variant="subsection" as="h2" id="t-danger" color="danger">
                  Strefa niebezpieczna
                </Heading>
                <Text variant="caption" color="muted" as="p" className={styles.secDesc}>
                  Akcje nieodwracalne. Dobrze pomyśl i — jeśli możesz — wyeksportuj dane przed
                  kliknięciem.
                </Text>
              </div>
              <span className={styles.secKicker}>
                <Text variant="nano" as="span" weight="bold" mono color="muted">
                  US-46
                </Text>
              </span>
            </header>

            {/* Zawieś widoczność */}
            <div className={styles.dangerItem}>
              <div className={styles.dangerInfo}>
                <div className={styles.dangerTitle}>
                  <IconAlertTriangle width="13" height="13" className={styles.dangerTitleIco} />
                  <Text variant="body-sm" as="span" weight="bold" color="danger">
                    Zawieś widoczność warsztatu
                  </Text>
                </div>
                <Text variant="caption" color="secondary" as="p">
                  Ukryj warsztat z wyszukiwarki na czas nieokreślony — bez usuwania konta.
                  Istniejące rezerwacje pozostają, ale nowe nie mogą być składane. Odwracalne jednym
                  kliknięciem.
                </Text>
              </div>
              <Button variant="danger" size="sm">
                <IconEyeOff width="12" height="12" />
                Ukryj warsztat
              </Button>
            </div>

            {/* Usuń konto */}
            <div className={styles.dangerItem}>
              <div className={styles.dangerInfo}>
                <div className={styles.dangerTitle}>
                  <IconAlertTriangle width="13" height="13" className={styles.dangerTitleIco} />
                  <Text variant="body-sm" as="span" weight="bold" color="danger">
                    Usuń konto i wszystkie dane
                  </Text>
                </div>
                <Text variant="caption" color="secondary" as="p">
                  Nieodwracalne. Warsztat znika z wyszukiwarki natychmiast, dane pozostają w
                  systemie 30 dni (okres odwołania), potem są{' '}
                  <Text variant="caption" as="span" weight="bold">
                    trwale usunięte
                  </Text>
                  . Wymagamy potwierdzenia hasłem → SMS → wpisania nazwy warsztatu.
                </Text>
              </div>
              <Button variant="danger" size="sm">
                <IconTrash width="12" height="12" />
                Usuń konto
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
