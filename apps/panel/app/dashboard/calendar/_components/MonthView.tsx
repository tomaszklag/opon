'use client';

import { useState, useRef } from 'react';
import { Spinner, Text } from '@opony/design-system-web';
import type { Booking, BookingStatus } from '../../../../api-data-access/bookings';
import type { WorkerTask } from '../../../../api-data-access/worker-tasks';
import type { ScheduleException } from '../../../../api-data-access/schedule-exceptions';
import type { Worker } from '../../../../api-data-access/workers';
import { IconInfo, IconArrowRight, IconGripVertical } from '../../../../components/icons';
import { HOLIDAY_MAP } from '../../../../lib/holidays';
import {
  MONTH_NAMES,
  buildMonthGrid,
  isSameDay,
  isToday,
  formatTime,
  formatDayDate,
  timeAgo,
  visitCountLabel,
  toISODate,
} from '../calendar.utils';
import styles from '../calendar.module.css';

const WEEK_DAY_LABELS = ['PON', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND'];
const MAX_CHIPS = 3;

interface MonthViewProps {
  month: Date;
  bookings: Booking[];
  tasks: WorkerTask[];
  exceptions: ScheduleException[];
  workers: Worker[];
  isLoading: boolean;
  selectedDate?: Date | null;
  onBookingClick?: (booking: Booking) => void;
  onSlotClick?: (date: Date, time: string, x: number, y: number) => void;
  onReschedule?: (booking: Booking, newDate: Date, newTime: string) => void;
}

interface DragState {
  bookingId: string;
  overDay: Date | null;
}

function leavePrefix(type: Worker['leaves'][number]['type']): string {
  if (type === 'VACATION') return 'Urlop';
  if (type === 'SICK') return 'L4';
  return 'Nieob.';
}

function getChipClass(status: BookingStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return styles.monthChipConfirmed ?? '';
    case 'PENDING':
      return styles.monthChipPending ?? '';
    case 'IN_PROGRESS':
      return styles.monthChipProgress ?? '';
    case 'COMPLETED':
      return styles.monthChipCompleted ?? '';
    default:
      return styles.monthChipCompleted ?? '';
  }
}

export function MonthView({
  month,
  bookings,
  tasks,
  exceptions,
  workers,
  isLoading,
  selectedDate,
  onBookingClick,
  onSlotClick,
  onReschedule,
}: MonthViewProps) {
  const grid = buildMonthGrid(month);
  const [dragDisplay, setDragDisplay] = useState<DragState | null>(null);
  const overDayRef = useRef<Date | null>(null);
  const justDraggedRef = useRef(false);

  function startChipDrag(e: React.MouseEvent, booking: Booking) {
    if (!onReschedule) return;
    e.stopPropagation();
    overDayRef.current = null;

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    setDragDisplay({ bookingId: booking.id, overDay: null });

    function onMove(me: MouseEvent) {
      const el = document.elementFromPoint(me.clientX, me.clientY);
      const dayEl = (el as Element | null)?.closest('[data-monthday]');
      const iso = dayEl?.getAttribute('data-monthday');
      overDayRef.current = iso ? new Date(iso) : null;
      setDragDisplay({ bookingId: booking.id, overDay: overDayRef.current });
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const overDay = overDayRef.current;
      overDayRef.current = null;
      setDragDisplay(null);

      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 0);

      if (overDay && !isSameDay(overDay, new Date(booking.startAt))) {
        const d = new Date(booking.startAt);
        const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        onReschedule?.(booking, overDay, timeStr);
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const totalCount = bookings.length;
  const confirmedCount = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS',
  ).length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const inProgressCount = bookings.filter((b) => b.status === 'IN_PROGRESS').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');

  function getDayBookings(day: Date): Booking[] {
    return bookings
      .filter((b) => isSameDay(new Date(b.startAt), day))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  function getDayTasks(day: Date): WorkerTask[] {
    return tasks
      .filter((t) => isSameDay(new Date(t.startAt), day))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  function getDayWorkers(iso: string): { worker: Worker; leave: Worker['leaves'][number] }[] {
    return workers.flatMap((w) => {
      const leave = w.leaves.find(
        (l) => iso >= l.startDate.slice(0, 10) && iso <= l.endDate.slice(0, 10),
      );
      return leave ? [{ worker: w, leave }] : [];
    });
  }

  return (
    <div className={styles.content}>
      {/* ── Calendar grid ── */}
      <div className={styles.monthCalContainer}>
        {/* Day name header */}
        <div className={styles.monthDayHeaders}>
          {WEEK_DAY_LABELS.map((label) => (
            <div key={label} className={styles.monthDayHeader}>
              {label}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className={styles.monthGrid}>
          {grid.flat().map((day) => {
            const todayDay = isToday(day);
            const isOutOfMonth = day.getMonth() !== month.getMonth();
            const isSunday = day.getDay() === 0;
            const dayBookings = getDayBookings(day);
            const dayTasks = getDayTasks(day);
            const totalItems = dayBookings.length + dayTasks.length;
            const visible = dayBookings.slice(0, MAX_CHIPS);
            const overflow = totalItems - MAX_CHIPS;

            const iso = toISODate(day);
            const holiday = HOLIDAY_MAP.get(iso);
            const exception = exceptions.find((e) => e.date.slice(0, 10) === iso);
            const dayWorkers = !isOutOfMonth ? getDayWorkers(iso) : [];

            const isDayOff = isSunday || !!holiday;
            const isInteractive = !isDayOff && !isOutOfMonth;
            return (
              <div
                key={day.toISOString()}
                data-monthday={isInteractive ? day.toISOString() : undefined}
                className={[
                  styles.monthCell,
                  todayDay ? styles.monthCellToday : '',
                  isOutOfMonth ? styles.monthCellOuter : '',
                  isDayOff ? styles.monthCellSunday : '',
                  isInteractive ? styles.monthCellInteractive : '',
                  selectedDate && isSameDay(day, selectedDate) ? styles.monthCellSelected : '',
                  dragDisplay?.overDay && isSameDay(day, dragDisplay.overDay)
                    ? styles.monthCellDropTarget
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={
                  isInteractive
                    ? (e) => {
                        if (justDraggedRef.current) return;
                        onSlotClick?.(day, '09:00', e.clientX, e.clientY);
                      }
                    : undefined
                }
              >
                <div className={`${styles.monthDayNum} ${todayDay ? styles.monthDayNumToday : ''}`}>
                  {day.getDate()}
                  {dayBookings.length > 0 && !todayDay && (
                    <span className={styles.monthDayCount}>
                      {visitCountLabel(dayBookings.length)}
                    </span>
                  )}
                </div>

                {holiday && <div className={styles.monthHolidayChip}>{holiday}</div>}
                {dayWorkers.length > 0 && (
                  <div className={styles.leavePills}>
                    {dayWorkers.map(({ worker, leave }) => (
                      <span
                        key={worker.id}
                        className={`${styles.leavePill} ${styles.leavePillOther}`}
                        title={`${worker.name}${leave.note ? `: ${leave.note}` : ''}`}
                      >
                        {leavePrefix(leave.type)}: {worker.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}
                {exception && (
                  <div
                    className={`${styles.monthExceptChip} ${exception.isClosed ? styles.monthExceptChipClosed : styles.monthExceptChipModified}`}
                    title={exception.reason}
                  >
                    {exception.isClosed
                      ? `Zamknięte`
                      : `Sk. godz. ${exception.customOpenTime ?? ''}–${exception.customCloseTime ?? ''}`}
                  </div>
                )}

                {!isDayOff &&
                  visible.map((b) => (
                    <div
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      className={[
                        styles.monthBookingChip,
                        getChipClass(b.status),
                        dragDisplay?.bookingId === b.id ? styles.monthBookingChipDragging : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={`${b.clientName} — ${formatTime(b.startAt)} – ${formatTime(b.endAt)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (justDraggedRef.current) return;
                        onBookingClick?.(b);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onBookingClick?.(b);
                      }}
                    >
                      <span className={styles.monthChipTime}>{formatTime(b.startAt)}</span>
                      <span className={styles.monthChipName}>{b.clientName}</span>
                      {onReschedule && (
                        <div
                          className={styles.monthDragHandle}
                          onMouseDown={(e) => startChipDrag(e, b)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconGripVertical width="8" height="8" />
                        </div>
                      )}
                    </div>
                  ))}

                {!isDayOff &&
                  dayTasks.slice(0, Math.max(0, MAX_CHIPS - dayBookings.length)).map((t) => (
                    <div
                      key={t.id}
                      className={styles.monthTaskChip}
                      title={`${t.title}${t.workerName ? ` — ${t.workerName}` : ''} · ${formatTime(t.startAt)}–${formatTime(t.endAt)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className={styles.monthChipTime}>{formatTime(t.startAt)}</span>
                      <span className={styles.monthChipName}>{t.title}</span>
                    </div>
                  ))}

                {overflow > 0 && <div className={styles.monthOverflow}>+{overflow} więcej</div>}
              </div>
            );
          })}
        </div>

        {isLoading && (
          <div className={styles.loadingWrap}>
            <Spinner size="sm" label="Ładowanie rezerwacji…" />
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <aside className={styles.side} aria-label="Podsumowanie miesiąca">
        <section>
          <div className={styles.sideSecTitle}>
            {MONTH_NAMES[month.getMonth()]}
            <Text variant="kicker-sm" as="span" color="muted" className={styles.sideSecHint}>
              {month.getFullYear()}
            </Text>
          </div>
          <div className={styles.weekStats}>
            <div className={`${styles.statBox} ${styles.statBoxAccent}`}>
              <div className={`${styles.statVal} ${styles.statValAccent}`}>
                {totalCount}
                <Text variant="nano" as="span" color="muted" className={styles.statUnit}>
                  wizyt
                </Text>
              </div>
              <Text variant="nano" as="div" color="muted" className={styles.statLbl}>
                Razem
              </Text>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statVal}>
                {confirmedCount}
                <Text variant="nano" as="span" color="muted" className={styles.statUnit}>
                  ✓
                </Text>
              </div>
              <Text variant="nano" as="div" color="muted" className={styles.statLbl}>
                Potwierdzone
              </Text>
            </div>
            <div className={styles.statBox}>
              <div className={`${styles.statVal} ${styles.statValWarn}`}>
                {pendingCount}
                <Text variant="nano" as="span" color="muted" className={styles.statUnit}>
                  ⚠
                </Text>
              </div>
              <Text variant="nano" as="div" color="muted" className={styles.statLbl}>
                Oczekują
              </Text>
            </div>
            <div className={styles.statBox}>
              <div className={`${styles.statVal} ${styles.statValSuccess}`}>
                {completedCount}
                <Text variant="nano" as="span" color="muted" className={styles.statUnit}>
                  ✓
                </Text>
              </div>
              <Text variant="nano" as="div" color="muted" className={styles.statLbl}>
                Zakończone
              </Text>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.sideSecTitle}>Legenda</div>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.legendSwatchConfirmed}`} />
              <Text variant="body-sm" as="span" color="secondary">
                Potwierdzona
              </Text>
              <Text variant="kicker-sm" as="span" className={styles.legendCount}>
                {confirmedCount}
              </Text>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.legendSwatchPending}`} />
              <Text variant="body-sm" as="span" color="secondary">
                Oczekuje
              </Text>
              <Text variant="kicker-sm" as="span" className={styles.legendCount}>
                {pendingCount}
              </Text>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.legendSwatchProgress}`} />
              <Text variant="body-sm" as="span" color="secondary">
                W trakcie
              </Text>
              <Text variant="kicker-sm" as="span" className={styles.legendCount}>
                {inProgressCount}
              </Text>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.legendSwatchCompleted}`} />
              <Text variant="body-sm" as="span" color="secondary">
                Zakończona
              </Text>
              <Text variant="kicker-sm" as="span" className={styles.legendCount}>
                {completedCount}
              </Text>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.legendSwatchTask}`} />
              <Text variant="body-sm" as="span" color="secondary">
                Zadanie
              </Text>
              <Text variant="kicker-sm" as="span" className={styles.legendCount}>
                {tasks.length}
              </Text>
            </div>
          </div>
        </section>

        {pendingBookings.length > 0 && (
          <section className={styles.pendingCard}>
            <div className={styles.pendingHead}>
              <span className={styles.pendingIcon} aria-hidden="true">
                <IconInfo width="14" height="14" />
              </span>
              <Text variant="nano" as="span" className={styles.pendingTitle}>
                {pendingBookings.length}{' '}
                {pendingBookings.length === 1 ? 'rezerwacja czeka' : 'rezerwacje czekają'}
              </Text>
            </div>
            <Text variant="body-sm" as="div" color="secondary" className={styles.pendingBody}>
              {pendingBookings.map((b, i) => {
                const visitDay = isSameDay(new Date(b.startAt), new Date())
                  ? 'dziś'
                  : formatDayDate(new Date(b.startAt));
                return (
                  <span key={b.id}>
                    {i > 0 && ' '}
                    <Text variant="body-sm" as="span" weight="bold" color="primary">
                      {b.clientName}
                    </Text>{' '}
                    ({visitDay} {formatTime(b.startAt)}) czeka{' '}
                    <Text variant="kicker-sm" as="span" color="warning" weight="bold">
                      {timeAgo(b.createdAt)}
                    </Text>
                    .
                  </span>
                );
              })}
            </Text>
            <button className={styles.pendingCta} type="button">
              <IconArrowRight width="12" height="12" />
              Przejrzyj teraz
            </button>
          </section>
        )}

        <Text variant="body-sm" as="div" color="muted" className={styles.calFootHint}>
          <Text variant="body-sm" as="span" color="primary" weight="bold">
            Tip:
          </Text>{' '}
          Widok miesięczny pokazuje wszystkie wizyty. Kliknij dzień, aby przejść do widoku
          dziennego.
        </Text>
      </aside>
    </div>
  );
}
