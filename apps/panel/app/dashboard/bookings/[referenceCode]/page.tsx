'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../../lib/hooks/use-auth-guard';
import { useBookingDetail } from '../../../../lib/hooks/use-booking-detail';
import { bookingsApi } from '../../../../api-data-access/bookings';
import type { BookingStatus, StatusAction } from '../../../../api-data-access/bookings';
import {
  IconChevronLeft,
  IconShare,
  IconPrint,
  IconPhone,
  IconMail,
  IconPlay,
  IconMap,
  IconReschedule,
  IconCar,
  IconCalendarAdd,
  IconLocation,
  IconXClose,
  IconCheck,
  IconInfo,
} from '../../../../components/icons';
import styles from './booking-detail.module.css';

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Oczekuje',
  CONFIRMED: 'Potwierdzona',
  IN_PROGRESS: 'W trakcie',
  COMPLETED: 'Zakończona',
  CANCELLED_BY_CLIENT: 'Anulowana',
  CANCELLED_BY_PROVIDER: 'Anulowana',
  CANCELLED_BY_SYSTEM: 'Anulowana',
  NO_SHOW: 'Nieobecność',
  REJECTED: 'Odrzucona',
};

const MONTH_NAMES_GEN = [
  'Stycznia',
  'Lutego',
  'Marca',
  'Kwietnia',
  'Maja',
  'Czerwca',
  'Lipca',
  'Sierpnia',
  'Września',
  'Października',
  'Listopada',
  'Grudnia',
];

const DAY_NAMES = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function formatDayDate(isoString: string): string {
  const d = new Date(isoString);
  const monthName = MONTH_NAMES_GEN[d.getMonth()] ?? 'sty';
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${monthName}`;
}

function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const day = d.getDate();
  const month = (MONTH_NAMES_GEN[d.getMonth()] ?? 'sty').slice(0, 3).toLowerCase();
  const year = d.getFullYear();
  const time = formatTime(isoString);
  return `${day} ${month} ${year} · ${time}`;
}

function getDurationMin(startAt: string, endAt: string): number {
  return Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000);
}

function getCountdown(startAt: string, status: BookingStatus): string {
  if (status === 'IN_PROGRESS') return 'Teraz';
  if (
    status === 'COMPLETED' ||
    status === 'CANCELLED_BY_CLIENT' ||
    status === 'CANCELLED_BY_PROVIDER' ||
    status === 'CANCELLED_BY_SYSTEM' ||
    status === 'NO_SHOW' ||
    status === 'REJECTED'
  ) {
    return formatDayDate(startAt);
  }

  const now = new Date();
  const start = new Date(startAt);
  const diffMs = start.getTime() - now.getTime();

  if (diffMs <= 0) return 'Teraz';

  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays >= 1) return `Za ${diffDays} ${diffDays === 1 ? 'dzień' : 'dni'}`;
  if (diffHours >= 1) return `Za ${diffHours} godz`;
  return `Za ${diffMin} min`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
}

function formatPrice(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

function isTerminalStatus(status: BookingStatus): boolean {
  return [
    'COMPLETED',
    'CANCELLED_BY_CLIENT',
    'CANCELLED_BY_PROVIDER',
    'CANCELLED_BY_SYSTEM',
    'NO_SHOW',
    'REJECTED',
  ].includes(status);
}

function isCancelled(status: BookingStatus): boolean {
  return ['CANCELLED_BY_CLIENT', 'CANCELLED_BY_PROVIDER', 'CANCELLED_BY_SYSTEM'].includes(status);
}

// ── Status pill helper ────────────────────────────────────────────────────────

function getStatusPillClass(status: BookingStatus): string {
  switch (status) {
    case 'PENDING':
      return styles.pillPending ?? '';
    case 'CONFIRMED':
      return styles.pillConfirmed ?? '';
    case 'IN_PROGRESS':
      return styles.pillInProgress ?? '';
    case 'COMPLETED':
      return styles.pillCompleted ?? '';
    default:
      return styles.pillCancelled ?? '';
  }
}

function getHeroClass(status: BookingStatus): string {
  switch (status) {
    case 'PENDING':
      return styles.statusHeroPending ?? '';
    case 'IN_PROGRESS':
      return styles.statusHeroInProgress ?? '';
    case 'COMPLETED':
      return styles.statusHeroCompleted ?? '';
    case 'CANCELLED_BY_CLIENT':
    case 'CANCELLED_BY_PROVIDER':
    case 'CANCELLED_BY_SYSTEM':
    case 'NO_SHOW':
    case 'REJECTED':
      return styles.statusHeroCancelled ?? '';
    default:
      return '';
  }
}

function getStatusGlow(status: BookingStatus): string {
  switch (status) {
    case 'PENDING':
      return 'var(--warning-muted)';
    case 'IN_PROGRESS':
      return 'var(--info-muted)';
    default:
      return 'var(--accent-muted)';
  }
}

function getHeroPillClass(status: BookingStatus): string {
  switch (status) {
    case 'PENDING':
      return styles.heroPillBigPending ?? '';
    case 'IN_PROGRESS':
      return styles.heroPillBigInProgress ?? '';
    case 'COMPLETED':
      return styles.heroPillBigCompleted ?? '';
    case 'CANCELLED_BY_CLIENT':
    case 'CANCELLED_BY_PROVIDER':
    case 'CANCELLED_BY_SYSTEM':
    case 'NO_SHOW':
    case 'REJECTED':
      return styles.heroPillBigCancelled ?? '';
    default:
      return '';
  }
}

// ── Code split renderer (e.g. OPN-4F2K → "OPN" accent-"-" "4F2K") ────────────

function ReferenceCode({ code }: { code: string }) {
  const idx = code.indexOf('-');
  if (idx === -1) return <>{code}</>;
  return (
    <>
      {code.slice(0, idx)}
      <span className={styles.breadcrumbCodeAccent}>-</span>
      {code.slice(idx + 1)}
    </>
  );
}

function HeroCode({ code }: { code: string }) {
  const idx = code.indexOf('-');
  if (idx === -1) return <>{code}</>;
  return (
    <>
      {code.slice(0, idx)}
      <span className={styles.heroCodeAccent}>-</span>
      {code.slice(idx + 1)}
    </>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

interface TimelineEvent {
  label: string;
  time: string | null;
  by?: string;
  type: 'done' | 'current' | 'future';
}

function buildTimeline(booking: {
  createdAt: string;
  confirmedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  startAt: string;
  status: BookingStatus;
  client: { clientName: string };
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  events.push({
    label: 'Klient zarezerwował termin',
    time: formatDateTime(booking.createdAt),
    by: booking.client.clientName,
    type: 'done',
  });

  if (booking.confirmedAt) {
    events.push({
      label: 'Potwierdziłaś rezerwację',
      time: formatDateTime(booking.confirmedAt),
      by: 'Ty · z dashboardu',
      type: 'done',
    });
  }

  if (booking.startedAt) {
    events.push({
      label: 'Wizyta rozpoczęta',
      time: formatDateTime(booking.startedAt),
      type: 'done',
    });
  }

  if (booking.completedAt) {
    events.push({
      label: 'Wizyta zakończona',
      time: formatDateTime(booking.completedAt),
      type: 'done',
    });
  }

  if (booking.cancelledAt) {
    const label = isCancelled(booking.status) ? 'Rezerwacja anulowana' : 'Wizyta odwołana';
    events.push({
      label,
      time: formatDateTime(booking.cancelledAt),
      type: 'done',
    });
  }

  // Current event: upcoming visit (not yet cancelled/completed)
  if (!booking.completedAt && !booking.cancelledAt) {
    const countdown = getCountdown(booking.startAt, booking.status);
    events.push({
      label: `Wizyta — ${formatDayDate(booking.startAt)}, ${formatTime(booking.startAt)}`,
      time: booking.status === 'IN_PROGRESS' ? 'Teraz' : countdown,
      type: 'current',
    });

    // Future — completion after visit
    if (booking.status !== 'IN_PROGRESS') {
      events.push({
        label: 'Zakończenie + oceń',
        time: 'po wizycie',
        type: 'future',
      });
    }
  }

  return events;
}

// ── Page component ────────────────────────────────────────────────────────────

interface PageProps {
  params: { referenceCode: string };
}

export default function BookingDetailPage({ params }: PageProps) {
  const { referenceCode } = params;
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const { booking, isLoading, error, mutate } = useBookingDetail(referenceCode);
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleAction(action: StatusAction, reason?: string) {
    setActionLoading(true);
    setActionError(null);
    try {
      await bookingsApi.updateStatus(referenceCode, action, reason);
      await mutate();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Wystąpił błąd. Spróbuj ponownie.';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie rezerwacji…" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.loadingWrap}>
        <Text variant="body-sm" as="p" color="muted">
          {error ? 'Nie udało się załadować rezerwacji.' : 'Rezerwacja nie istnieje.'}
        </Text>
      </div>
    );
  }

  const { status } = booking;
  const countdown = getCountdown(booking.startAt, status);
  const durationMin = getDurationMin(booking.startAt, booking.endAt);
  const initials = getInitials(booking.client.clientName);
  const timeline = buildTimeline(booking);

  const addressFull = [booking.addressLine, booking.addressCity].filter(Boolean).join(', ');
  const mapsUrl = addressFull
    ? `https://maps.google.com/?q=${encodeURIComponent(addressFull)}`
    : null;

  const statusPillClass = getStatusPillClass(status);
  const heroClass = getHeroClass(status);
  const heroPillClass = getHeroPillClass(status);
  const statusGlow = getStatusGlow(status);
  const isActiveStatus = status === 'CONFIRMED' || status === 'IN_PROGRESS' || status === 'PENDING';

  return (
    <div className={styles.main} style={{ '--status-glow': statusGlow } as React.CSSProperties}>
      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.backBtn}
          aria-label="Wstecz do rezerwacji"
          onClick={() => router.push('/dashboard/bookings')}
        >
          <IconChevronLeft width="13" height="13" />
        </button>

        <nav className={styles.breadcrumb} aria-label="Ścieżka nawigacji">
          <Text variant="body-sm" as="span" color="muted" weight="semibold">
            Panel
          </Text>
          <span className={styles.breadcrumbSep}>/</span>
          <Text variant="body-sm" as="span" color="muted" weight="semibold">
            Rezerwacje
          </Text>
          <span className={styles.breadcrumbSep}>/</span>
          <Text as="span" variant="body-sm" mono className={styles.breadcrumbCode}>
            <ReferenceCode code={referenceCode} />
          </Text>
        </nav>

        <span className={styles.spacer} />

        <span
          className={`${styles.statusPill} ${statusPillClass} ${isActiveStatus ? styles.statusPillActive : ''}`}
        >
          {STATUS_LABEL[status]}
        </span>

        <button type="button" className={styles.tbBtn}>
          <IconShare width="13" height="13" />
          Udostępnij
        </button>
        <button type="button" className={styles.tbBtn}>
          <IconPrint width="13" height="13" />
          Drukuj zlecenie
        </button>
      </header>

      {/* ── Content ── */}
      <div className={styles.content}>
        {actionError && (
          <Text variant="body-sm" as="p" className={styles.errorBanner}>
            {actionError}
          </Text>
        )}

        {/* ── Status Hero ── */}
        <section className={`${styles.statusHero} ${heroClass}`} aria-label="Status rezerwacji">
          <div className={styles.heroStatusCol}>
            <span className={`${styles.heroPillBig} ${heroPillClass}`}>{STATUS_LABEL[status]}</span>
            <span className={styles.heroCode}>
              <HeroCode code={booking.referenceCode} />
            </span>
          </div>

          <div className={styles.heroWhenCol}>
            <span className={styles.heroCountdown}>{countdown}</span>
            <span className={styles.heroWhen}>
              <Text variant="body-sm" as="span" weight="bold">
                {formatDayDate(booking.startAt)}
              </Text>
              <span className={styles.heroWhenTime}>
                {formatTime(booking.startAt)} – {formatTime(booking.endAt)}
              </span>
              <span className={styles.heroDurationChip}>~{durationMin} min</span>
            </span>
          </div>

          <div className={styles.heroActions}>
            <button type="button" className={styles.tbBtn}>
              <IconCalendarAdd width="13" height="13" />
              Dodaj do kalendarza
            </button>
          </div>
        </section>

        {/* ── 2-col ── */}
        <div className={styles.twoCol}>
          {/* ── Left column ── */}
          <div className={styles.colLeft}>
            {/* Client card */}
            <section className={styles.secCard} aria-label="Klient">
              <div className={styles.secHead}>
                <Heading variant="section" as="h2">
                  Klient
                </Heading>
                <Text variant="nano" as="span" mono color="muted">
                  Zweryfikowany · {booking.client.bookingCount}. rezerwacja
                </Text>
              </div>
              <div className={styles.clientRow}>
                <div className={styles.clientAvatar} aria-hidden="true">
                  {initials}
                </div>
                <div className={styles.clientCol}>
                  <div className={styles.clientNameRow}>
                    <Text variant="body-md" as="span" weight="bold">
                      {booking.client.clientName}
                    </Text>
                    <span className={styles.verifiedBadge}>
                      <IconCheck width="10" height="10" />
                      Zweryfikowany
                    </span>
                  </div>
                  <div className={styles.clientMeta}>
                    <Text variant="nano" as="span" color="muted">
                      <strong>{booking.client.bookingCount}</strong>{' '}
                      {booking.client.bookingCount === 1
                        ? 'rezerwacja'
                        : booking.client.bookingCount < 5
                          ? 'rezerwacje'
                          : 'rezerwacji'}
                    </Text>
                  </div>
                </div>
                <button type="button" className={styles.smsBtn}>
                  <IconMail width="13" height="13" />
                  Wyślij SMS
                </button>
                <button type="button" className={styles.callBtn}>
                  <IconPhone width="15" height="15" />
                  Zadzwoń
                  <span className={styles.phoneMono}>{booking.client.clientPhone}</span>
                </button>
              </div>
            </section>

            {/* Address card — only if address present */}
            {(booking.addressLine ?? booking.addressCity) && (
              <section className={styles.secCard} aria-label="Miejsce wizyty">
                <div className={styles.secHead}>
                  <Heading variant="section" as="h2">
                    Miejsce wizyty
                  </Heading>
                  <Text variant="nano" as="span" color="muted">
                    w dojezdzie
                  </Text>
                </div>
                <div className={styles.addressGrid}>
                  <div className={styles.addrInfo}>
                    <div className={styles.addrRow}>
                      <span
                        className={`${styles.addrIco} ${styles.addrIcoAccent}`}
                        aria-hidden="true"
                      >
                        <IconLocation width="14" height="14" />
                      </span>
                      <div className={styles.addrCol}>
                        <Text variant="nano" as="span" weight="bold" color="muted">
                          Adres klienta
                        </Text>
                        {booking.addressLine && (
                          <Text variant="body-sm" as="span" weight="bold">
                            {booking.addressLine}
                          </Text>
                        )}
                        {booking.addressCity && (
                          <Text variant="nano" as="span" color="secondary">
                            {booking.addressCity}
                          </Text>
                        )}
                        {booking.travelFeePln !== null && booking.travelFeePln === 0 && (
                          <span className={styles.travelZoneBadge}>W strefie · dopłata 0 zł</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mini map placeholder */}
                  <div className={styles.miniMapPlaceholder}>
                    <IconLocation width="24" height="24" className={styles.miniMapIco} />
                    <Text variant="nano" as="span" color="muted">
                      {addressFull}
                    </Text>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.navigateBtn}
                      >
                        <IconMap width="14" height="14" />
                        Nawiguj w Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Vehicle card — only if vehicle present */}
            {booking.vehicle && (
              <section className={styles.secCard} aria-label="Pojazd">
                <div className={styles.secHead}>
                  <Heading variant="section" as="h2">
                    Pojazd
                  </Heading>
                  <Text variant="nano" as="span" mono color="muted">
                    Z profilu klienta
                  </Text>
                </div>
                <div className={styles.vehicleRow}>
                  <span className={styles.vehicleIco} aria-hidden="true">
                    <IconCar width="20" height="20" />
                  </span>
                  <div className={styles.vehicleCol}>
                    <Text variant="body" as="span" weight="bold">
                      {booking.vehicle.nickname}
                    </Text>
                    <div className={styles.vehicleMeta}>
                      <span className={styles.tireTaq}>{booking.vehicle.tireSize}</span>
                      {booking.sizeTier && (
                        <Text variant="nano" as="span" color="muted">
                          tier &bdquo;{booking.sizeTier}&rdquo;
                        </Text>
                      )}
                    </div>
                  </div>
                  {booking.basePricePln !== null && (
                    <div className={styles.pricePreview}>
                      <Text variant="nano" as="span" weight="bold" color="muted">
                        {booking.serviceType ?? 'Usługa'}
                      </Text>
                      <span className={styles.pricePreviewValue}>
                        {formatPrice(booking.basePricePln ?? 0)}
                        <span className={styles.pricePreviewZl}>zł</span>
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Note card — only if notes present */}
            {booking.notes && (
              <section className={styles.secCard} aria-label="Notatka od klienta">
                <div className={styles.secHead}>
                  <Heading variant="section" as="h2">
                    Notatka od klienta
                  </Heading>
                  <Text variant="nano" as="span" color="muted">
                    opcjonalna
                  </Text>
                </div>
                <div>
                  <blockquote className={styles.noteQuote}>
                    <Text variant="body" as="span" color="primary">
                      &bdquo;{booking.notes}&rdquo;
                    </Text>
                  </blockquote>
                  <Text variant="nano" as="p" color="muted" className={styles.noteAttrib}>
                    — {booking.client.clientName} · dodano {formatDateTime(booking.createdAt)}
                  </Text>
                </div>
              </section>
            )}

            {/* Timeline */}
            <section className={styles.secCard} aria-label="Historia rezerwacji">
              <div className={styles.secHead}>
                <Heading variant="section" as="h2">
                  Historia
                </Heading>
                <Text variant="nano" as="span" mono color="muted">
                  {timeline.length}{' '}
                  {timeline.length === 1
                    ? 'zdarzenie'
                    : timeline.length <= 4
                      ? 'zdarzenia'
                      : 'zdarzeń'}
                </Text>
              </div>
              <div className={styles.tlWrap}>
                {timeline.map((event, idx) => (
                  <div
                    key={idx}
                    className={`${styles.tlEvent} ${
                      event.type === 'current' ? styles.tlEventCurrent : ''
                    } ${event.type === 'future' ? styles.tlEventFuture : ''}`}
                  >
                    <Text
                      variant="body-sm"
                      as="div"
                      weight="bold"
                      color={
                        event.type === 'current'
                          ? 'accent'
                          : event.type === 'future'
                            ? 'muted'
                            : 'primary'
                      }
                    >
                      {event.label}
                    </Text>
                    {event.time && (
                      <Text variant="nano" as="div" mono color="muted" style={{ marginTop: 3 }}>
                        {event.time}
                      </Text>
                    )}
                    {event.by && (
                      <Text variant="nano" as="div" color="muted" className={styles.tlEventBy}>
                        {event.by}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right column (sticky) ── */}
          <aside className={styles.colRight} aria-label="Płatność i akcje">
            {/* Price card */}
            <section className={styles.priceCard}>
              <div className={styles.priceHead}>
                <Heading variant="section" as="h3">
                  Do zapłaty
                </Heading>
                <span className={styles.offlineBadge}>Po wizycie · offline</span>
              </div>

              <div className={styles.priceRows}>
                {/* Base service */}
                <div className={styles.priceRow}>
                  <Text variant="body-sm" as="span" color="secondary">
                    {booking.serviceType ?? 'Usługa'}
                    {booking.tireSize ? ` (${booking.tireSize})` : ''}
                  </Text>
                  <span className={styles.priceRowVal}>
                    {booking.basePricePln != null ? `${formatPrice(booking.basePricePln)} zł` : '—'}
                  </span>
                </div>

                {/* Travel fee */}
                <div className={styles.priceRow}>
                  <Text variant="body-sm" as="span" color="secondary">
                    Dojazd
                  </Text>
                  <span
                    className={`${styles.priceRowVal} ${
                      booking.travelFeePln === 0 ? styles.priceRowValSuccess : ''
                    }`}
                  >
                    {booking.travelFeePln == null
                      ? '—'
                      : booking.travelFeePln === 0
                        ? 'w cenie'
                        : `${formatPrice(booking.travelFeePln)} zł`}
                  </span>
                </div>

                {/* TPMS / balancing */}
                <div className={styles.priceRow}>
                  <Text variant="body-sm" as="span" color="secondary">
                    Wyważanie (opcj.)
                  </Text>
                  <span className={`${styles.priceRowVal} ${styles.priceRowValMuted}`}>
                    niewybrane
                  </span>
                </div>
              </div>

              <hr className={styles.priceDivider} />

              <div className={styles.priceTotal}>
                <Text
                  variant="nano"
                  as="span"
                  weight="bold"
                  color="muted"
                  className={styles.priceTotalLabel}
                >
                  Klient zapłaci Ci
                </Text>
                <span className={styles.priceTotalVal}>
                  {booking.totalPricePln != null ? formatPrice(booking.totalPricePln) : '—'}
                  <span className={styles.priceTotalZl}>zł</span>
                </span>
              </div>

              <div className={styles.adrNote}>
                <span className={styles.adrNoteIcon}>
                  <IconInfo width="13" height="13" />
                </span>
                <Text variant="nano" as="div" color="muted">
                  <strong className={styles.adrNoteStrong}>Aplikacja darmowa w pilocie.</strong>{' '}
                  Klient płaci Tobie bezpośrednio — gotówka lub przelew. Platforma pobiera{' '}
                  <strong className={styles.adrNoteStrong}>0% prowizji</strong> (zgodnie z
                  regulaminem).
                </Text>
              </div>
            </section>

            {/* Actions card */}
            <section className={styles.actionsCard} aria-label="Akcje">
              {status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    className={styles.actionPrimary}
                    disabled={actionLoading}
                    onClick={() => handleAction('confirm')}
                  >
                    <IconCheck width="16" height="16" />
                    Potwierdź rezerwację
                  </button>
                  <button
                    type="button"
                    className={styles.actionDanger}
                    disabled={actionLoading}
                    onClick={() => handleAction('reject')}
                  >
                    <IconXClose width="12" height="12" />
                    Odrzuć
                  </button>
                </>
              )}

              {status === 'CONFIRMED' && (
                <>
                  <button
                    type="button"
                    className={styles.actionPrimary}
                    disabled={actionLoading}
                    onClick={() => handleAction('start')}
                  >
                    <IconPlay width="16" height="16" />
                    Rozpocznij wizytę
                  </button>
                  <div className={styles.actionSecondaryRow}>
                    <button
                      type="button"
                      className={styles.actionSecondary}
                      disabled={actionLoading}
                    >
                      <IconReschedule width="12" height="12" />
                      Zmień termin
                    </button>
                    <button
                      type="button"
                      className={styles.actionSecondary}
                      disabled={actionLoading}
                    >
                      <IconMail width="12" height="12" />
                      SMS do klienta
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.actionDanger}
                    disabled={actionLoading}
                    onClick={() => handleAction('cancel')}
                  >
                    <IconXClose width="12" height="12" />
                    Anuluj rezerwację
                  </button>
                  <div className={styles.noShowHint}>
                    <span className={styles.noShowHintIcon}>
                      <IconInfo width="12" height="12" />
                    </span>
                    <Text variant="nano" as="span" color="muted">
                      Po upływie {formatTime(booking.startAt)} pojawi się opcja{' '}
                      <span className={styles.noShowHintWarn}>
                        &bdquo;Klient się nie pojawił&rdquo;
                      </span>{' '}
                      (2-strike policy)
                    </Text>
                  </div>
                </>
              )}

              {status === 'IN_PROGRESS' && (
                <>
                  <button
                    type="button"
                    className={`${styles.actionPrimary} ${styles.actionPrimarySuccess}`}
                    disabled={actionLoading}
                    onClick={() => handleAction('complete')}
                  >
                    <IconCheck width="16" height="16" />
                    Zakończ wizytę
                  </button>
                  <button
                    type="button"
                    className={styles.actionDanger}
                    disabled={actionLoading}
                    onClick={() => handleAction('cancel')}
                  >
                    <IconXClose width="12" height="12" />
                    Anuluj rezerwację
                  </button>
                </>
              )}

              {isTerminalStatus(status) && (
                <Text variant="body-sm" as="p" color="muted" className={styles.terminalMsg}>
                  {status === 'COMPLETED'
                    ? 'Wizyta zakończona.'
                    : isCancelled(status)
                      ? 'Rezerwacja anulowana.'
                      : status === 'NO_SHOW'
                        ? 'Klient się nie pojawił.'
                        : 'Rezerwacja odrzucona.'}
                </Text>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
