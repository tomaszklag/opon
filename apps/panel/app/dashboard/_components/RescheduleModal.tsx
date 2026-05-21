'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Heading, NumberStepper, Spinner, Text } from '@opony/design-system-web';
import { TimeInput } from '@opony/design-system-web';
import { FieldLabel } from '@opony/design-system-web';
import { Tooltip } from '@opony/design-system-web';
import { useAvailability } from '../../../lib/hooks/use-availability';
import { useBookings } from '../../../lib/hooks/use-bookings';
import { bookingsApi } from '../../../api-data-access/bookings';
import { DayTimeline } from './DayTimeline';
import { IconChevronLeft, IconChevronRight, IconInfo, IconXClose } from '../../../components/icons';
import styles from './RescheduleModal.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CANCELLED_STATUSES = new Set([
  'CANCELLED_BY_CLIENT',
  'CANCELLED_BY_PROVIDER',
  'CANCELLED_BY_SYSTEM',
  'NO_SHOW',
  'REJECTED',
]);

const DAY_NAMES = ['Niedz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
const MONTH_NAMES = [
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

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function addMinutes(timeHHMM: string, minutes: number): string {
  const [hh, mm] = timeHHMM.split(':').map(Number);
  const total = ((((hh ?? 0) * 60 + (mm ?? 0) + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  referenceCode: string;
  currentBookingId: string;
  initialStartAt: string;
  initialEndAt: string;
  workerId?: string | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RescheduleModal({
  isOpen,
  onClose,
  onSuccess,
  referenceCode,
  currentBookingId,
  initialStartAt,
  initialEndAt,
  workerId,
}: RescheduleModalProps) {
  const pad = (n: number) => String(n).padStart(2, '0');

  const initDate = initialStartAt.slice(0, 10);
  const initStartD = new Date(initialStartAt);
  const initEndD = new Date(initialEndAt);
  const initStart = `${pad(initStartD.getHours())}:${pad(initStartD.getMinutes())}`;
  const initDur = Math.round((initEndD.getTime() - initStartD.getTime()) / 60_000);

  const [date, setDate] = useState(initDate);
  const [timeInput, setTimeInput] = useState(initStart);
  const [durationMinutes, setDurationMinutes] = useState(initDur);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-init whenever modal opens (e.g. booking was rescheduled once, opens again)
  useEffect(() => {
    if (!isOpen) return;
    setDate(initDate);
    setTimeInput(initStart);
    setDurationMinutes(initDur);
    setError(null);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const endTimeStr =
    timeInput && /^\d{2}:\d{2}$/.test(timeInput) ? addMinutes(timeInput, durationMinutes) : '';

  const { availability, isLoading: availLoading } = useAvailability(date, workerId ?? undefined);
  const weekStart = useMemo(() => getWeekStart(date), [date]);
  const { bookings: allBookings } = useBookings(weekStart);

  const dayBookings = useMemo(
    () =>
      allBookings.filter(
        (b) =>
          b.startAt.slice(0, 10) === date &&
          !CANCELLED_STATUSES.has(b.status) &&
          b.id !== currentBookingId,
      ),
    [allBookings, date, currentBookingId],
  );

  async function handleSave() {
    if (!timeInput || !endTimeStr) return;
    setLoading(true);
    setError(null);
    try {
      const startAt = new Date(`${date}T${timeInput}:00`).toISOString();
      const endAt = new Date(`${date}T${endTimeStr}:00`).toISOString();
      await bookingsApi.reschedule(referenceCode, startAt, endAt, false);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd zmiany terminu.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Zmień termin" className={styles.modal}>
        {/* ── Head ── */}
        <div className={styles.head}>
          <Heading variant="section" as="h2">
            Zmień termin
          </Heading>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Zamknij">
            <IconXClose width="13" height="13" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>
          {/* Date navigator */}
          <div className={styles.dateNav}>
            <button
              type="button"
              className={styles.dateNavBtn}
              onClick={() => setDate(addDays(date, -1))}
              aria-label="Poprzedni dzień"
            >
              <IconChevronLeft width="14" height="14" />
            </button>
            <Text variant="body-sm" as="span" weight="bold">
              {formatDayLabel(date)}
            </Text>
            <button
              type="button"
              className={styles.dateNavBtn}
              onClick={() => setDate(addDays(date, 1))}
              aria-label="Następny dzień"
            >
              <IconChevronRight width="14" height="14" />
            </button>
          </div>

          {/* Timeline */}
          <div className={styles.timelineWrap}>
            {availLoading ? (
              <div className={styles.spinnerRow}>
                <Spinner size="sm" />
              </div>
            ) : (
              <DayTimeline
                slots={availability?.slots ?? []}
                bookings={dayBookings}
                durationMinutes={durationMinutes}
                selectedTime={timeInput}
                date={date}
                onSelect={setTimeInput}
              />
            )}
          </div>

          {/* Od · Czas · Do */}
          <div className={styles.timeRangeGroup}>
            <div className={styles.timeRangeHeader}>
              <Text variant="label" color="muted" as="span">
                Godziny wizyty
              </Text>
              <Tooltip content="Zmiana czasu trwania przesuwa koniec. Zmiana końca cofa początek.">
                <span className={styles.infoIcon}>
                  <IconInfo width={12} height={12} />
                </span>
              </Tooltip>
            </div>
            <div className={styles.timeRangeFields}>
              <div className={styles.timeRangeField}>
                <FieldLabel>Od</FieldLabel>
                <TimeInput value={timeInput} onChange={setTimeInput} dropdownStep={5} />
              </div>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
              <div className={styles.timeRangeDuration}>
                <FieldLabel>Czas (min)</FieldLabel>
                <NumberStepper
                  value={String(durationMinutes)}
                  onChange={(v) =>
                    setDurationMinutes(Math.max(5, Math.min(600, parseInt(v, 10) || 60)))
                  }
                  min={5}
                  max={600}
                  step={5}
                  inputWidth={52}
                />
              </div>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
              <div className={styles.timeRangeField}>
                <FieldLabel>Do</FieldLabel>
                <TimeInput
                  value={endTimeStr}
                  onChange={(v) => {
                    if (/^\d{2}:\d{2}$/.test(v) && /^\d{2}:\d{2}$/.test(timeInput)) {
                      const [sh, sm] = timeInput.split(':').map(Number);
                      const [eh, em] = v.split(':').map(Number);
                      const dur = (eh ?? 0) * 60 + (em ?? 0) - (sh ?? 0) * 60 - (sm ?? 0);
                      if (dur > 0) setDurationMinutes(dur);
                      else setTimeInput(addMinutes(v, -durationMinutes));
                    }
                  }}
                  dropdownStep={5}
                  disabled={!timeInput || !/^\d{2}:\d{2}$/.test(timeInput)}
                />
              </div>
            </div>
          </div>

          {error && (
            <Text variant="nano" as="p" className={styles.errorMsg}>
              {error}
            </Text>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={styles.foot}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Anuluj
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={loading || !timeInput || !endTimeStr}
          >
            {loading ? 'Zapisuję…' : 'Zapisz termin'}
          </Button>
        </div>
      </div>
    </>
  );
}
