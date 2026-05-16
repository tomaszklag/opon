'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Heading, Spinner, Text } from '@opony/design-system-web';
import { toast } from '@opony/design-system-web';
import type { BookingDetail, BookingStatus } from '../../../api-data-access/bookings';
import { bookingsApi } from '../../../api-data-access/bookings';
import { useBookingDetail } from '../../../lib/hooks/use-booking-detail';
import {
  IconXClose,
  IconPhone,
  IconCar,
  IconCalendar,
  IconArrowRight,
  IconWarehouse,
  IconStations,
  IconCheck,
  IconBan,
  IconPlay,
} from '../../../components/icons';
import styles from './BookingDetailPanel.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

interface BookingDetailPanelProps {
  referenceCode: string | null;
  onClose: () => void;
  onMutate?: () => void;
}

type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'warning' | 'danger';

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Oczekuje',
  CONFIRMED: 'Potwierdzona',
  IN_PROGRESS: 'W trakcie',
  COMPLETED: 'Zakończona',
  CANCELLED_BY_CLIENT: 'Anulowana',
  CANCELLED_BY_PROVIDER: 'Anulowana',
  CANCELLED_BY_SYSTEM: 'Anulowana',
  REJECTED: 'Odrzucona',
  NO_SHOW: 'Nieobecność',
};

const STATUS_COLOR: Record<BookingStatus, TextColor> = {
  PENDING: 'warning',
  CONFIRMED: 'accent',
  IN_PROGRESS: 'accent',
  COMPLETED: 'secondary',
  CANCELLED_BY_CLIENT: 'muted',
  CANCELLED_BY_PROVIDER: 'muted',
  CANCELLED_BY_SYSTEM: 'muted',
  REJECTED: 'danger',
  NO_SHOW: 'muted',
};

const SERVICE_TYPE_LABEL: Record<string, string> = {
  SEASONAL_SWAP: 'Wymiana sezonowa',
  TIRE_REPAIR: 'Naprawa opony',
  TIRE_FITTING: 'Montaż opon',
  BALANCING: 'Wyważanie',
  OTHER: 'Inna usługa',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString('pl-PL', opts);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isTomorrow =
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear();

  const weekday = fmt(iso, { weekday: 'short' });
  const dayMonth = fmt(iso, { day: 'numeric', month: 'short' });

  if (isToday) return `Dziś, ${weekday} ${dayMonth}`;
  if (isTomorrow) return `Jutro, ${weekday} ${dayMonth}`;
  return `${weekday} ${dayMonth}`;
}

function fmtTimeRange(startAt: string, endAt: string): string {
  const from = fmt(startAt, { hour: '2-digit', minute: '2-digit' });
  const to = fmt(endAt, { hour: '2-digit', minute: '2-digit' });
  return `${from} – ${to}`;
}

function serviceLabel(serviceType: string | null, sizeTier: string | null | undefined): string {
  if (!serviceType) return '';
  const base = SERVICE_TYPE_LABEL[serviceType] ?? serviceType;
  return sizeTier ? `${base} • Rozmiar ${sizeTier}` : base;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.dataRow}>
      <Text variant="nano" color="secondary" as="p">
        {label}
      </Text>
      <Text variant="body-sm" weight="bold" as="p">
        {value}
      </Text>
    </div>
  );
}

// ── Panel content ────────────────────────────────────────────────────────────

interface PanelContentProps {
  booking: BookingDetail;
  onClose: () => void;
  onMutate?: () => void;
  mutate: () => void;
}

function PanelContent({ booking, onClose, onMutate, mutate }: PanelContentProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const statusLabel = STATUS_LABEL[booking.status] ?? booking.status;
  const statusColor: TextColor = STATUS_COLOR[booking.status] ?? 'secondary';

  const isSeasonalSwap = booking.serviceType === 'SEASONAL_SWAP';
  const canAddToDepot =
    isSeasonalSwap && booking.status === 'COMPLETED' && !booking.hasTireSetsInDepot;
  const hasDepot = isSeasonalSwap && booking.hasTireSetsInDepot;

  async function handleAction(action: 'confirm' | 'start' | 'complete' | 'cancel' | 'reject') {
    setLoading(action);
    try {
      await bookingsApi.updateStatus(booking.referenceCode, action);
      void mutate();
      onMutate?.();
      if (action === 'cancel' || action === 'reject') {
        onClose();
      }
    } catch {
      toast.error('Nie udało się wykonać akcji. Spróbuj ponownie.');
    } finally {
      setLoading(null);
    }
  }

  const isTerminal = [
    'COMPLETED',
    'CANCELLED_BY_CLIENT',
    'CANCELLED_BY_PROVIDER',
    'CANCELLED_BY_SYSTEM',
    'NO_SHOW',
    'REJECTED',
  ].includes(booking.status);

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Text variant="nano" weight="bold" mono color={statusColor} as="p">
            {statusLabel}
          </Text>
          <Heading variant="subsection" as="h2">
            {booking.client.clientName}
          </Heading>
          {(booking.serviceType || booking.tireSize) && (
            <Text variant="body-sm" color="secondary" as="p">
              {serviceLabel(booking.serviceType ?? null, booking.sizeTier)}
              {booking.serviceType && booking.tireSize ? '' : ''}
            </Text>
          )}
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Zamknij panel"
        >
          <IconXClose width={16} height={16} />
        </button>
      </div>

      <hr className={styles.divider} />

      {/* ── Date & station ── */}
      <div className={styles.section}>
        <div className={styles.metaRow}>
          <IconCalendar className={styles.metaIcon} width={14} height={14} />
          <Text variant="body-sm" as="span">
            {fmtDate(booking.startAt)} • {fmtTimeRange(booking.startAt, booking.endAt)}
          </Text>
        </div>
        {booking.stationId && (
          <div className={styles.metaRow}>
            <IconStations className={styles.metaIcon} width={14} height={14} />
            <Text variant="body-sm" color="secondary" as="span">
              Stanowisko
            </Text>
          </div>
        )}
      </div>

      <hr className={styles.divider} />

      {/* ── Client & vehicle ── */}
      <div className={styles.section}>
        {booking.client.clientPhone && (
          <div className={styles.metaRow}>
            <IconPhone className={styles.metaIcon} width={14} height={14} />
            <Text variant="body-sm" as="span">
              {booking.client.clientPhone}
            </Text>
          </div>
        )}
        {booking.vehicle && (
          <div className={styles.metaRow}>
            <IconCar className={styles.metaIcon} width={14} height={14} />
            <Text variant="body-sm" as="span">
              {booking.vehicle.nickname}
              {booking.vehicle.tireSize ? ` • ${booking.vehicle.tireSize}` : ''}
            </Text>
          </div>
        )}
        {!booking.vehicle && booking.tireSize && (
          <DataRow label="Rozmiar opon" value={booking.tireSize} />
        )}
        {booking.totalPricePln != null && (
          <DataRow label="Cena" value={`${booking.totalPricePln} zł`} />
        )}
        {booking.notes && <DataRow label="Uwagi" value={booking.notes} />}
      </div>

      {/* ── Actions ── */}
      {!isTerminal && (
        <>
          <hr className={styles.divider} />
          <div className={styles.actions}>
            {booking.status === 'PENDING' && (
              <div className={styles.actionRow}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction('confirm')}
                  loading={loading === 'confirm'}
                  disabled={loading !== null}
                >
                  <IconCheck width={13} height={13} />
                  Potwierdź
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction('reject')}
                  loading={loading === 'reject'}
                  disabled={loading !== null}
                >
                  Odrzuć
                </Button>
              </div>
            )}
            {booking.status === 'CONFIRMED' && (
              <div className={styles.actionRow}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction('start')}
                  loading={loading === 'start'}
                  disabled={loading !== null}
                >
                  <IconPlay width={12} height={12} />
                  Rozpocznij
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction('cancel')}
                  loading={loading === 'cancel'}
                  disabled={loading !== null}
                >
                  <IconBan width={13} height={13} />
                  Anuluj
                </Button>
              </div>
            )}
            {booking.status === 'IN_PROGRESS' && (
              <div className={styles.actionRow}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction('complete')}
                  loading={loading === 'complete'}
                  disabled={loading !== null}
                >
                  <IconCheck width={13} height={13} />
                  Zakończ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction('cancel')}
                  loading={loading === 'cancel'}
                  disabled={loading !== null}
                >
                  <IconBan width={13} height={13} />
                  Anuluj
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Depot section (SEASONAL_SWAP only) ── */}
      {(canAddToDepot || hasDepot) && (
        <>
          <hr className={styles.divider} />
          <div className={styles.section}>
            {canAddToDepot && (
              <div className={styles.actionRow}>
                <Link href="/dashboard/depot" className={styles.depotLink}>
                  <IconWarehouse width={14} height={14} />
                  <Text variant="body-sm" weight="bold" as="span">
                    Dodaj do składu
                  </Text>
                </Link>
              </div>
            )}
            {hasDepot && (
              <div className={styles.depotRow}>
                <div className={styles.metaRow}>
                  <IconWarehouse className={styles.metaIcon} width={14} height={14} />
                  <Text variant="body-sm" as="span">
                    Opony w składzie
                  </Text>
                </div>
                <Link href="/dashboard/depot" className={styles.depotLink}>
                  <Text variant="nano" weight="bold" as="span">
                    Przejdź do składu
                  </Text>
                  <IconArrowRight width={12} height={12} />
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <Link href={`/dashboard/bookings/${booking.referenceCode}`} className={styles.footerLink}>
          <Text variant="body-sm" as="span">
            Pełne szczegóły wizyty
          </Text>
          <IconArrowRight width={14} height={14} />
        </Link>
      </div>
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export function BookingDetailPanel({ referenceCode, onClose, onMutate }: BookingDetailPanelProps) {
  const { booking, isLoading, mutate } = useBookingDetail(referenceCode);

  // ESC key handler
  useEffect(() => {
    if (referenceCode === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [referenceCode, onClose]);

  if (referenceCode === null) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Szczegóły rezerwacji"
        className={styles.panel}
      >
        {isLoading && (
          <div className={styles.loading}>
            <Spinner size="md" />
          </div>
        )}
        {!isLoading && booking && (
          <PanelContent booking={booking} onClose={onClose} onMutate={onMutate} mutate={mutate} />
        )}
        {!isLoading && !booking && referenceCode && (
          <div className={styles.loading}>
            <Text variant="body-sm" color="muted" as="p">
              Nie znaleziono rezerwacji.
            </Text>
          </div>
        )}
      </div>
    </>
  );
}
