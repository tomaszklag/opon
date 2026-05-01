'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Heading, ProgressBar, Text, Timeline } from '@opony/design-system-web';
import type { TimelineEvent } from '@opony/design-system-web';
import { IconCheck, IconChevronRight, IconUsers } from '../../../components/icons';
import styles from './waiting-for-clients.module.css';

// ── Static data ───────────────────────────────────────────────────────────────

const ROADMAP: TimelineEvent[] = [
  {
    id: 'portal',
    label: 'Portal LIVE',
    sub: 'Provider może konfigurować warsztat',
    time: '11 kwi',
    state: 'done',
  },
  {
    id: 'approved',
    label: 'Twoja rejestracja zaakceptowana',
    sub: 'Weryfikacja GUS + zdjęcia · Status APPROVED',
    time: '18 kwi',
    state: 'done',
  },
  {
    id: 'recruit',
    label: 'Rekrutacja pozostałych 5 pilotów',
    sub: '• Jesteśmy tutaj · 3 z 8 warsztatów onboardowanych',
    time: 'Tyg. 3-4',
    state: 'current',
  },
  {
    id: 'client-launch',
    label: 'Start aplikacji klienckiej',
    sub: 'app.opony.app LIVE · Pierwsze rezerwacje',
    time: '14 maja',
    state: 'future',
  },
  {
    id: 'beta',
    label: 'Beta z F&F · soft launch',
    sub: 'Friends & family testing + marketing ramp',
    time: 'Lip-sie',
    state: 'future',
  },
  {
    id: 'autumn',
    label: 'Sezon jesienny · public launch',
    sub: 'Szczyt popytu — wymiana letnie → zimowe',
    time: 'Październik',
    state: 'future',
  },
];

const CHECKLIST: { label: string; done: boolean; href?: string }[] = [
  { label: 'Dane firmy (NIP, CEIDG)', done: true },
  { label: 'Cennik (3 tiery)', done: true },
  { label: 'Godziny otwarcia', done: true },
  { label: 'Typ serwisu & usługi', done: true },
  { label: 'Galeria (5 zdjęć)', done: true },
  { label: 'Strefa dojazdu', done: true },
  { label: 'Opis warsztatu (< 60 zn)', done: false, href: '/dashboard/profile' },
];

const TIPS = [
  {
    num: '01',
    title: 'Powiedz stałym klientom',
    desc: 'Przy następnej wizycie wspomnij: „Od 14 maja możecie rezerwować online na opony.app — koniec z telefonami". Wyślemy Ci gotowe ulotki do wydrukowania.',
    cta: 'Pobierz ulotki (PDF)',
  },
  {
    num: '02',
    title: 'Udostępnij swój profil publiczny',
    desc: 'Twój profil jest już widoczny na opony.app. Wrzuć link na Facebook warsztatu, do Google Business, do stopki maila.',
    cta: 'Kopiuj link + QR do druku',
  },
  {
    num: '03',
    title: 'Doprecyzuj konfigurację',
    desc: 'Masz jeszcze 1 pole do uzupełnienia — opis warsztatu w profilu. Krótszy niż 60 znaków → wyszukiwarka pokazuje placeholder. Zajmie Ci to 2 min.',
    cta: 'Uzupełnij opis',
    href: '/dashboard/profile',
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(target: Date): number {
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86_400_000));
}

// ── Component ─────────────────────────────────────────────────────────────────

interface WaitingForClientsProps {
  launchDate: Date;
}

export function WaitingForClients({ launchDate }: WaitingForClientsProps) {
  const router = useRouter();
  const [days, setDays] = useState(() => daysUntil(launchDate));

  useEffect(() => {
    const id = setInterval(() => setDays(daysUntil(launchDate)), 60_000);
    return () => clearInterval(id);
  }, [launchDate]);

  const isLive = days === 0;
  const launchLabel = launchDate.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.root}>
      {/* ── Hero countdown ──────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="waiting-title">
        <div className={styles.heroCol}>
          <span className={styles.eyebrow}>
            <Text variant="nano" as="span" weight="extrabold" mono>
              Pilot Nowy Sącz · Faza A live
            </Text>
          </span>
          <Heading variant="hero" as="h1" id="waiting-title">
            GOTOWE!
            <br />
            KLIENCI STARTUJĄ
            <br />
            <Heading variant="hero" as="span" color="accent">
              WKRÓTCE.
            </Heading>
          </Heading>
          <Text variant="body-sm" color="secondary" as="p" className={styles.heroSub}>
            Twój profil jest{' '}
            <Text variant="body-sm" as="span" weight="bold">
              widoczny w wyszukiwarce
            </Text>{' '}
            warsztatów w Nowym Sączu. Rekrutujemy jeszcze{' '}
            <Text variant="body-sm" as="span" weight="bold">
              5 pilotażowych warsztatów
            </Text>
            , a aplikacja kliencka startuje zgodnie z planem. Uzupełnij resztę konfiguracji i
            poinformuj stałych klientów — startujemy z silnym popytem.
          </Text>
        </div>

        <div className={styles.countdown} aria-label="Dni do startu klientów" aria-live="polite">
          <Text variant="nano" as="span" weight="extrabold" mono color="muted">
            {isLive ? 'Aplikacja kliencka' : 'Start klientów za'}
          </Text>
          <Heading variant="hero-xl" color="accent" as="span" className={styles.countdownVal}>
            {isLive ? 'LIVE' : days}
          </Heading>
          {!isLive && (
            <Text variant="label" as="span" color="secondary">
              {days === 1 ? 'dzień' : 'dni'}
            </Text>
          )}
          <Text variant="nano" as="span" color="muted" mono className={styles.countdownDate}>
            Planowany launch:{' '}
            <Text variant="nano" as="span" weight="bold" mono color="accent">
              {launchLabel}
            </Text>
          </Text>
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────────────────────────── */}
      <section className={styles.timelineCard} aria-labelledby="roadmap-title">
        <header className={styles.cardHead}>
          <Heading variant="subsection" as="h2" id="roadmap-title">
            Roadmapa pilotu
          </Heading>
          <span className={styles.cardKicker}>
            <Text variant="nano" as="span" weight="bold" mono color="muted">
              ADR-009 faza A/B
            </Text>
          </span>
        </header>
        <Timeline events={ROADMAP} />
      </section>

      {/* ── Right column ────────────────────────────────────────────────────── */}
      <div className={styles.rightCol}>
        {/* Setup progress */}
        <section className={styles.setupCard} aria-labelledby="setup-title">
          <header className={styles.cardHead}>
            <Heading variant="subsection" as="h2" id="setup-title">
              Twoja konfiguracja
            </Heading>
            <span className={styles.cardKicker}>
              <Text variant="nano" as="span" weight="bold" mono color="muted">
                6 / 7 ✓
              </Text>
            </span>
          </header>

          <div className={styles.setupTop}>
            <span>
              <Heading variant="display-xl" as="span">
                85
              </Heading>
              <Text variant="body-sm" as="span" color="muted" weight="bold">
                {' '}
                %
              </Text>
            </span>
            <Text variant="nano" as="span" weight="bold" mono color="muted">
              Ukończone
            </Text>
          </div>

          <ProgressBar value={85} label="Konfiguracja warsztatu" />

          <ul className={styles.checklist} aria-label="Lista kroków konfiguracji">
            {CHECKLIST.map((item) => (
              <li
                key={item.label}
                className={`${styles.checkItem} ${item.done ? styles.checkDone : styles.checkPending}`}
              >
                <span className={styles.checkBox} aria-hidden="true">
                  {item.done && <IconCheck width="9" height="9" />}
                </span>
                <Text
                  variant="body-sm"
                  as="span"
                  color={item.done ? undefined : 'warning'}
                  weight={item.done ? undefined : 'bold'}
                >
                  {item.label}
                </Text>
                {item.href && (
                  <Link href={item.href} className={styles.checkLink}>
                    <Text variant="kicker-sm" as="span" color="accent">
                      Dokończ →
                    </Text>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Waitlist card */}
        <div className={styles.waitlistCard} aria-label="Waitlist klientów">
          <span className={styles.waitlistIco} aria-hidden="true">
            <IconUsers width="20" height="20" />
          </span>
          <div className={styles.waitlistCol}>
            <Heading variant="display" as="span">
              47
            </Heading>
            <Text variant="nano" as="span" weight="bold" mono color="muted">
              Klientów już czeka na aplikację w NS
            </Text>
            <Text variant="nano" as="span" weight="bold" mono className={styles.waitlistTrend}>
              +12 w ostatnim tygodniu
            </Text>
          </div>
        </div>
      </div>

      {/* ── Preselling tips ─────────────────────────────────────────────────── */}
      <section className={styles.tipsCard} aria-labelledby="tips-title">
        <header className={styles.cardHead}>
          <Heading variant="subsection" as="h2" id="tips-title">
            W międzyczasie — pomóż nam startować z popytem
          </Heading>
          <span className={styles.cardKicker}>
            <Text variant="nano" as="span" weight="bold" mono color="muted">
              Preselling
            </Text>
          </span>
        </header>

        <div className={styles.tipsGrid}>
          {TIPS.map((tip) => (
            <article key={tip.num} className={styles.tipCard}>
              <Heading variant="subsection" color="accent" as="span">
                {tip.num}
              </Heading>
              <Heading variant="subsection" as="h3">
                {tip.title}
              </Heading>
              <Text variant="body-sm" color="muted" as="p" className={styles.tipDesc}>
                {tip.desc}
              </Text>
              <div className={styles.tipCtaStrip}>
                <Button
                  variant="link"
                  size="sm"
                  onClick={'href' in tip ? () => router.push(tip.href) : undefined}
                >
                  {tip.cta}
                  <IconChevronRight width="11" height="11" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
