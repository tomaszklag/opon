'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Heading, Modal, Spinner, Text, toast } from '@opony/design-system-web';
import { useAuthGuard } from '../../../../lib/hooks/use-auth-guard';
import { RescheduleModal } from '../../_components/RescheduleModal';
import { EditBookingModal } from '../../_components/EditBookingModal';
import { useBookingDetail } from '../../../../lib/hooks/use-booking-detail';
import { bookingsApi } from '../../../../api-data-access/bookings';
import type { BookingStatus, StatusAction } from '../../../../api-data-access/bookings';
import { depotApi } from '../../../../api-data-access/depot';
import type { CreateTireSetBody } from '../../../../api-data-access/depot';
import { TireSetModal } from '../../depot/_components/TireSetModal';
import {
  IconChevronLeft,
  IconPhone,
  IconMail,
  IconPlay,
  IconMap,
  IconReschedule,
  IconCar,
  IconLocation,
  IconXClose,
  IconCheck,
  IconInfo,
  IconWorkers,
  IconStations,
  IconPencil,
  IconClock,
  IconWarehouse,
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

function parseWheelInfo(name: string | null): { displayName: string; wheelCount: number | null } {
  if (!name) return { displayName: '', wheelCount: null };
  // ManualBookingModal appends " (N koło|koła)" when wheelCount < 4
  const match = name.match(/\s+\((\d+)\s+ko[łl]/);
  if (match && match.index != null) {
    return {
      displayName: name.slice(0, match.index).trim(),
      wheelCount: parseInt(match[1] ?? '0', 10),
    };
  }
  return { displayName: name, wheelCount: null };
}

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
  const searchParams = useSearchParams();
  const fromCalendar = searchParams.get('from') === 'calendar';
  const calendarDate = searchParams.get('date');
  const backHref = fromCalendar
    ? `/dashboard/calendar${calendarDate ? `?date=${calendarDate}` : ''}`
    : '/dashboard/bookings';
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDepotModal, setShowDepotModal] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

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

  function openNotesEdit() {
    setNotesValue(booking?.notes ?? '');
    setEditingNotes(true);
  }

  async function handleSaveNotes() {
    setNotesSaving(true);
    try {
      await bookingsApi.updateNotes(referenceCode, notesValue.trim() || null);
      await mutate();
      setEditingNotes(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nie udało się zapisać notatki.');
    } finally {
      setNotesSaving(false);
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
  const minutesRunning =
    status === 'IN_PROGRESS'
      ? Math.floor((Date.now() - new Date(booking.startedAt ?? booking.startAt).getTime()) / 60000)
      : null;
  const isOverrun = minutesRunning != null && minutesRunning > durationMin;
  const overrunMin = isOverrun ? minutesRunning - durationMin : 0;
  const initials = getInitials(booking.client.clientName);
  const timeline = buildTimeline(booking);

  const addressFull = [booking.addressLine, booking.addressCity].filter(Boolean).join(', ');
  const mapsUrl = addressFull
    ? `https://maps.google.com/?q=${encodeURIComponent(addressFull)}`
    : null;

  const heroClass = getHeroClass(status);
  const heroPillClass = getHeroPillClass(status);
  const statusGlow = getStatusGlow(status);

  const canAddToDepot = booking.status === 'COMPLETED' && !booking.hasTireSetsInDepot;
  const canEdit = status === 'PENDING' || status === 'CONFIRMED' || status === 'IN_PROGRESS';
  const startAtDate = new Date(booking.startAt);
  const showNoShow =
    (status === 'CONFIRMED' || status === 'IN_PROGRESS') && startAtDate < new Date();
  const subServices = booking.service.subServices ?? [];
  const paidSubServices = subServices.filter((s) => s.pricePln != null && s.pricePln > 0);
  const includedSubServices = subServices.filter((s) => s.pricePln == null || s.pricePln === 0);
  const { displayName: serviceDisplayName, wheelCount: parsedWheelCount } = parseWheelInfo(
    booking.service.name ?? null,
  );
  // basePricePln is null for manual bookings — derive it from totalPricePln
  const derivedBasePricePln: number | null = (() => {
    if (booking.isCustomService) return booking.customPricePln ?? null;
    if (booking.basePricePln != null) return booking.basePricePln;
    if (booking.totalPricePln == null) return null;
    const paidSubsSum = paidSubServices.reduce((sum, s) => sum + (s.pricePln ?? 0), 0);
    const travel = (booking.travelFeePln ?? 0) > 0 ? (booking.travelFeePln ?? 0) : 0;
    return booking.totalPricePln - paidSubsSum - travel;
  })();

  async function handleDepotSubmit(body: CreateTireSetBody) {
    await depotApi.create(body);
    await mutate();
  }

  return (
    <>
      <Modal
        isOpen={showStartConfirm}
        onClose={() => setShowStartConfirm(false)}
        title="Rozpocząć wizytę przed czasem?"
        size="sm"
        footer={
          <>
            <Button
              variant="neutral"
              size="md"
              onClick={() => setShowStartConfirm(false)}
              disabled={actionLoading}
            >
              Anuluj
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={actionLoading}
              onClick={() => {
                setShowStartConfirm(false);
                void handleAction('start');
              }}
            >
              Tak, rozpocznij
            </Button>
          </>
        }
      >
        <Text variant="body-sm" as="p" color="secondary">
          Wizyta zaplanowana jest na{' '}
          <Text variant="body-sm" as="span" weight="bold" color="primary">
            {formatTime(booking.startAt)}
          </Text>
          . Czy na pewno chcesz ją teraz rozpocząć?
        </Text>
      </Modal>

      <RescheduleModal
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        onSuccess={() => void mutate()}
        referenceCode={referenceCode}
        currentBookingId={booking.id}
        initialStartAt={booking.startAt}
        initialEndAt={booking.endAt}
        workerId={booking.workerId}
      />

      <EditBookingModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={() => void mutate()}
        referenceCode={referenceCode}
        initialTotalPricePln={booking.totalPricePln ?? null}
        initialSubServices={booking.service.subServices.map((s) => ({
          name: s.name,
          pricePln: s.pricePln ?? null,
        }))}
        initialClientNote={booking.clientNote ?? null}
      />

      <TireSetModal
        isOpen={showDepotModal}
        onClose={() => setShowDepotModal(false)}
        onSubmit={handleDepotSubmit}
        initial={{
          clientName: booking.client.clientName,
          clientPhone: booking.client.clientPhone,
          tireSize: booking.service.tireSize ?? '',
          sourceBookingId: booking.id,
        }}
      />
      <div className={styles.main} style={{ '--status-glow': statusGlow } as React.CSSProperties}>
        {/* ── Topbar ── */}
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.backBtn}
            aria-label={fromCalendar ? 'Wstecz do kalendarza' : 'Wstecz do rezerwacji'}
            onClick={() => router.push(backHref)}
          >
            <IconChevronLeft width="13" height="13" />
          </button>

          <nav className={styles.breadcrumb} aria-label="Ścieżka nawigacji">
            <Text variant="body-sm" as="span" color="muted" weight="semibold">
              Panel
            </Text>
            <span className={styles.breadcrumbSep}>/</span>
            <Text variant="body-sm" as="span" color="muted" weight="semibold">
              {fromCalendar ? 'Kalendarz' : 'Rezerwacje'}
            </Text>
            <span className={styles.breadcrumbSep}>/</span>
            <Text as="span" variant="body-sm" mono className={styles.breadcrumbCode}>
              <ReferenceCode code={referenceCode} />
            </Text>
          </nav>
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
              <span className={`${styles.heroPillBig} ${heroPillClass}`}>
                {STATUS_LABEL[status]}
              </span>
              <span className={styles.heroCode}>
                <HeroCode code={booking.referenceCode} />
              </span>
            </div>

            <div className={styles.heroWhenCol}>
              <div className={styles.heroCountdownRow}>
                <span className={styles.heroCountdown}>{countdown}</span>
                {minutesRunning != null && (
                  <span className={isOverrun ? styles.heroOverrunChip : styles.heroElapsedChip}>
                    {isOverrun
                      ? `+${overrunMin} min ponad plan`
                      : `${minutesRunning} min w trakcie`}
                  </span>
                )}
              </div>
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
                    </div>
                    <Text
                      variant="nano"
                      as="span"
                      color="muted"
                      className={styles.clientInlineStats}
                    >
                      {booking.client.bookingCount}{' '}
                      {booking.client.bookingCount === 1
                        ? 'rezerwacja'
                        : booking.client.bookingCount < 5
                          ? 'rezerwacje'
                          : 'rezerwacji'}
                      {' · '}
                      {booking.client.bookingCountThisYear} w tym roku
                      {booking.client.avgRating != null && (
                        <> · ocena {booking.client.avgRating.toFixed(1)}</>
                      )}
                      {' · '}klient od {booking.client.clientSince}
                    </Text>
                  </div>
                  <div className={styles.clientPhone}>
                    <span className={styles.clientPhoneIco}>
                      <IconPhone width="13" height="13" />
                    </span>
                    <span className={styles.phoneMono}>{booking.client.clientPhone}</span>
                  </div>
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
                      </div>
                    </div>
                    {booking.basePricePln !== null && (
                      <div className={styles.pricePreview}>
                        <Text variant="nano" as="span" weight="bold" color="muted">
                          {booking.service.name ?? 'Usługa'}
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

              {/* Note card — always visible, inline-editable */}
              <section className={styles.secCard} aria-label="Notatki">
                <div className={styles.secHead}>
                  <Heading variant="section" as="h2">
                    Notatki
                  </Heading>
                  <div className={styles.notesHeadRight}>
                    <span className={styles.notesBadge}>
                      <IconPencil width="10" height="10" />
                      Wewnętrzne
                    </span>
                    {!editingNotes && (
                      <button
                        type="button"
                        className={styles.notesEditBtn}
                        onClick={openNotesEdit}
                        aria-label="Edytuj notatki"
                      >
                        <IconPencil width="11" height="11" />
                        {booking.notes ? 'Edytuj' : 'Dodaj'}
                      </button>
                    )}
                  </div>
                </div>

                {editingNotes ? (
                  <div className={styles.notesEditWrap}>
                    <textarea
                      className={styles.notesTextarea}
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      placeholder="Notatki widoczne tylko dla warsztatu…"
                      aria-label="Notatki wewnętrzne warsztatu"
                      autoFocus
                    />
                    <div className={styles.notesEditActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNotes(false)}
                        disabled={notesSaving}
                      >
                        Anuluj
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => void handleSaveNotes()}
                        disabled={notesSaving}
                      >
                        {notesSaving ? 'Zapisuję…' : 'Zapisz'}
                      </Button>
                    </div>
                  </div>
                ) : booking.notes ? (
                  <blockquote className={styles.noteQuote}>
                    <Text variant="body" as="span" color="primary">
                      {booking.notes}
                    </Text>
                  </blockquote>
                ) : (
                  <button type="button" className={styles.notesEmptyBtn} onClick={openNotesEdit}>
                    <Text variant="body-sm" as="span" color="muted">
                      Brak notatek — kliknij, aby dodać
                    </Text>
                  </button>
                )}
              </section>

              {/* Depot link — if tires in storage */}
              {booking.hasTireSetsInDepot && (
                <section className={styles.secCard} aria-label="Opony w składzie">
                  <div className={styles.secHead}>
                    <Heading variant="section" as="h2">
                      Skład opon
                    </Heading>
                    <span className={styles.depotBadge}>
                      <IconWarehouse width="11" height="11" />W składzie
                    </span>
                  </div>
                  <div className={styles.depotLinkRow}>
                    <Text variant="body-sm" as="span" color="secondary">
                      Opony tego klienta są przechowywane w składzie.
                    </Text>
                    <a href="/dashboard/depot" className={styles.depotLink}>
                      <IconWarehouse width="12" height="12" />
                      Przejdź do składu
                    </a>
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
              {/* Merged service + price card */}
              <section className={styles.priceCard} aria-label="Usługa i płatność">
                {/* ── Service identity ── */}
                <div className={styles.svcHead}>
                  <Text variant="body-md" as="span" weight="bold">
                    {serviceDisplayName || '—'}
                  </Text>
                  <div className={styles.svcHeadRight}>
                    <span
                      className={booking.isCustomService ? styles.customBadge : styles.catalogBadge}
                    >
                      {booking.isCustomService ? 'Poza cennikiem' : 'Z cennika'}
                    </span>
                    {canEdit && (
                      <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
                        <IconPencil width="11" height="11" />
                        Edytuj
                      </Button>
                    )}
                  </div>
                </div>

                {(booking.service.tireSize ||
                  !booking.isCustomService ||
                  booking.customDurationMinutes != null) && (
                  <div className={styles.svcMeta}>
                    {booking.service.tireSize && (
                      <span className={styles.tireTaq}>{booking.service.tireSize}</span>
                    )}
                    {!booking.isCustomService && (
                      <span className={styles.wheelChip}>
                        {parsedWheelCount !== null
                          ? `${parsedWheelCount} ${parsedWheelCount === 1 ? 'koło' : 'koła'}`
                          : 'komplet'}
                      </span>
                    )}
                    {booking.isCustomService && booking.customDurationMinutes != null && (
                      <span className={styles.durationChip}>
                        <IconClock width="11" height="11" />
                        {booking.customDurationMinutes} min
                      </span>
                    )}
                  </div>
                )}

                {(booking.workerName ?? booking.stationName) && (
                  <div className={styles.svcAssign}>
                    {booking.workerName && (
                      <span className={styles.svcAssignItem}>
                        <IconWorkers width="12" height="12" />
                        <Text variant="nano" as="span" color="secondary">
                          {booking.workerName}
                        </Text>
                      </span>
                    )}
                    {booking.stationName && (
                      <span className={styles.svcAssignItem}>
                        <IconStations width="12" height="12" />
                        <Text variant="nano" as="span" color="secondary">
                          {booking.stationName}
                        </Text>
                      </span>
                    )}
                  </div>
                )}

                <hr className={styles.svcDivider} />

                {/* ── Price breakdown ── */}
                <div className={styles.priceRows}>
                  <div className={styles.priceRow}>
                    <Text variant="body-sm" as="span" color="secondary">
                      Usługa
                    </Text>
                    <span className={styles.priceRowVal}>
                      {derivedBasePricePln != null ? `${formatPrice(derivedBasePricePln)} zł` : '—'}
                    </span>
                  </div>

                  {includedSubServices.map((s, i) => (
                    <div key={i} className={styles.priceRow}>
                      <Text variant="body-sm" as="span" color="secondary">
                        {s.name}
                      </Text>
                      <span className={`${styles.priceRowVal} ${styles.priceRowValSuccess}`}>
                        w cenie
                      </span>
                    </div>
                  ))}

                  {paidSubServices.map((s, i) => (
                    <div key={i} className={styles.priceRow}>
                      <Text variant="body-sm" as="span" color="secondary">
                        {s.name}
                      </Text>
                      <span className={styles.priceRowVal}>+{formatPrice(s.pricePln!)} zł</span>
                    </div>
                  ))}

                  {booking.travelFeePln != null && (
                    <div className={styles.priceRow}>
                      <Text variant="body-sm" as="span" color="secondary">
                        Dojazd
                      </Text>
                      <span
                        className={`${styles.priceRowVal} ${
                          booking.travelFeePln === 0 ? styles.priceRowValSuccess : ''
                        }`}
                      >
                        {booking.travelFeePln === 0
                          ? 'w cenie'
                          : `${formatPrice(booking.travelFeePln)} zł`}
                      </span>
                    </div>
                  )}
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

                {booking.clientNote && (
                  <div className={styles.clientNoteRow}>
                    <Text variant="nano" as="span" color="muted" className={styles.clientNoteLabel}>
                      Notatka dla klienta
                    </Text>
                    <Text variant="body-sm" as="p" color="secondary">
                      {booking.clientNote}
                    </Text>
                  </div>
                )}
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
                      onClick={() => {
                        if (new Date() < startAtDate) {
                          setShowStartConfirm(true);
                        } else {
                          void handleAction('start');
                        }
                      }}
                    >
                      <IconPlay width="16" height="16" />
                      Rozpocznij wizytę
                    </button>
                    <div className={styles.actionSecondaryRow}>
                      <button
                        type="button"
                        className={styles.actionSecondary}
                        disabled={actionLoading}
                        onClick={() => setShowReschedule(true)}
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
                    {showNoShow ? (
                      <button
                        type="button"
                        className={styles.actionNoShow}
                        disabled={actionLoading}
                        onClick={() => handleAction('no_show')}
                      >
                        Klient się nie pojawił
                      </button>
                    ) : (
                      <div className={styles.noShowHint}>
                        <span className={styles.noShowHintIcon}>
                          <IconInfo width="12" height="12" />
                        </span>
                        <Text variant="nano" as="span" color="muted">
                          Po {formatTime(booking.startAt)} pojawi się opcja{' '}
                          <span className={styles.noShowHintWarn}>
                            &bdquo;Klient się nie pojawił&rdquo;
                          </span>
                        </Text>
                      </div>
                    )}
                  </>
                )}

                {status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    className={`${styles.actionPrimary} ${styles.actionPrimarySuccess}`}
                    disabled={actionLoading}
                    onClick={() => handleAction('complete')}
                  >
                    <IconCheck width="16" height="16" />
                    Zakończ wizytę
                  </button>
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

                {canAddToDepot && (
                  <button
                    type="button"
                    className={styles.actionSecondaryFull}
                    onClick={() => setShowDepotModal(true)}
                  >
                    <IconWarehouse width="13" height="13" />
                    Dodaj stary zestaw do składu
                  </button>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
