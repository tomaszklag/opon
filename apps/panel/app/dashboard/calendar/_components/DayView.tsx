'use client';

import { useState, useRef } from 'react';
import { Spinner, Text } from '@opony/design-system-web';
import type { Booking, BookingStatus } from '../../../../api-data-access/bookings';
import type { WorkerTask } from '../../../../api-data-access/worker-tasks';
import type { ScheduleException } from '../../../../api-data-access/schedule-exceptions';
import type { Worker } from '../../../../api-data-access/workers';
import { IconInfo, IconArrowRight } from '../../../../components/icons';
import { HOLIDAY_MAP } from '../../../../lib/holidays';
import {
  HOURS,
  PX_PER_HOUR,
  GRID_HEIGHT,
  HOUR_START,
  DAY_ABBR,
  FilterType,
  FILTER_LABELS,
  isSameDay,
  isToday,
  formatTime,
  formatDayDate,
  getBookingStyle,
  timeAgo,
  matchesFilter,
  visitCountLabel,
  toISODate,
  snapTimeFromOffset,
} from '../calendar.utils';
import styles from '../calendar.module.css';

interface DayViewProps {
  day: Date;
  bookings: Booking[];
  tasks: WorkerTask[];
  exceptions: ScheduleException[];
  workers: Worker[];
  isLoading: boolean;
  nowLineTop: number;
  nowTime: string;
  onBookingClick?: (booking: Booking) => void;
  onSlotClick?: (date: Date, time: string, x: number, y: number) => void;
  onReschedule?: (booking: Booking, newDate: Date, newTime: string) => void;
}

function isDraggable(status: BookingStatus): boolean {
  return status === 'PENDING' || status === 'CONFIRMED' || status === 'IN_PROGRESS';
}

function getStatusClass(status: BookingStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return styles.confirmed ?? '';
    case 'PENDING':
      return styles.pending ?? '';
    case 'IN_PROGRESS':
      return styles.progress ?? '';
    case 'COMPLETED':
      return styles.completed ?? '';
    default:
      return `${styles.completed ?? ''} ${styles.past ?? ''}`;
  }
}

function leavePillClass(type: Worker['leaves'][number]['type']): string {
  if (type === 'VACATION') return styles.leavePillVacation ?? '';
  if (type === 'SICK') return styles.leavePillSick ?? '';
  return styles.leavePillOther ?? '';
}

function leavePrefix(type: Worker['leaves'][number]['type']): string {
  if (type === 'VACATION') return 'Urlop';
  if (type === 'SICK') return 'L4';
  if (type === 'UNPAID') return 'Bezpł.';
  return '';
}

export function DayView({
  day,
  bookings,
  tasks,
  exceptions,
  workers,
  isLoading,
  nowLineTop,
  nowTime,
  onBookingClick,
  onSlotClick,
  onReschedule,
}: DayViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoverTop, setHoverTop] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<string>('');
  const [dragDisplay, setDragDisplay] = useState<{
    bookingId: string;
    top: number;
    height: number;
    time: string;
    clientName: string;
  } | null>(null);
  const dragRef = useRef<{ booking: Booking; grabOffsetY: number; heightPx: number } | null>(null);
  const dragDisplayRef = useRef(dragDisplay);
  dragDisplayRef.current = dragDisplay;

  function startBookingDrag(e: React.MouseEvent, booking: Booking) {
    if (!isDraggable(booking.status) || !onReschedule) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const grabOffsetY = e.clientY - rect.top;
    const startObj = new Date(booking.startAt);
    const endObj = new Date(booking.endAt);
    const startMins = startObj.getHours() * 60 + startObj.getMinutes();
    const endMins = endObj.getHours() * 60 + endObj.getMinutes();
    const heightPx = Math.max(endMins - startMins, 20);

    dragRef.current = { booking, grabOffsetY, heightPx };
    const initDisplay = {
      bookingId: booking.id,
      top: startMins - HOUR_START * 60,
      height: heightPx,
      time: formatTime(booking.startAt),
      clientName: booking.clientName,
    };
    setDragDisplay(initDisplay);
    dragDisplayRef.current = initDisplay;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    function onMove(me: MouseEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      const colEl = (document.elementFromPoint(me.clientX, me.clientY) as Element | null)?.closest(
        '[data-calday]',
      ) as HTMLElement | null;
      if (!colEl) return;
      const colRect = colEl.getBoundingClientRect();
      const rawTop = me.clientY - colRect.top - drag.grabOffsetY;
      const snappedTop = Math.max(
        0,
        Math.min(Math.round(rawTop / 15) * 15, GRID_HEIGHT - drag.heightPx),
      );
      const next = {
        bookingId: drag.booking.id,
        top: snappedTop,
        height: drag.heightPx,
        time: snapTimeFromOffset(snappedTop),
        clientName: drag.booking.clientName,
      };
      dragDisplayRef.current = next;
      setDragDisplay(next);
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      const drag = dragRef.current;
      const display = dragDisplayRef.current;
      dragRef.current = null;
      setDragDisplay(null);
      setHoverTop(null);

      if (!drag || !display) return;
      const origTime = formatTime(drag.booking.startAt);
      if (display.time !== origTime) {
        onReschedule?.(drag.booking, day, display.time);
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const todayDay = isToday(day);
  const isSunday = day.getDay() === 0;
  const nowLineVisible = todayDay && nowLineTop >= 0 && nowLineTop <= GRID_HEIGHT;
  const gridlines = HOURS.slice(1).map((_, i) => (i + 1) * PX_PER_HOUR);

  const allDayBookings = bookings.filter((b) => isSameDay(new Date(b.startAt), day));
  const visibleBookings = allDayBookings.filter((b) => matchesFilter(b, activeFilter));

  const confirmedCount = allDayBookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS',
  ).length;
  const pendingCount = allDayBookings.filter((b) => b.status === 'PENDING').length;
  const completedCount = allDayBookings.filter((b) => b.status === 'COMPLETED').length;
  const inProgressCount = allDayBookings.filter((b) => b.status === 'IN_PROGRESS').length;
  const pendingBookings = allDayBookings.filter((b) => b.status === 'PENDING');

  const iso = toISODate(day);
  const holiday = HOLIDAY_MAP.get(iso);
  const exception = exceptions.find((e) => e.date.slice(0, 10) === iso);
  const workersOnLeave = workers.filter((w) =>
    w.leaves.some((l) => iso >= l.startDate.slice(0, 10) && iso <= l.endDate.slice(0, 10)),
  );

  return (
    <div className={styles.content}>
      {/* ── Calendar grid ── */}
      <div className={styles.calContainer}>
        {/* Day header */}
        <div className={styles.dayViewHeader}>
          <div className={styles.dayHeaderTz}>CET</div>
          <div
            className={`${styles.dayViewHeadCol} ${todayDay ? styles.today : ''} ${isSunday ? styles.closed : ''}`}
          >
            {todayDay && <span className={styles.todayBadge}>Dziś</span>}
            <span className={styles.dayAbbr}>{DAY_ABBR[day.getDay()]}</span>
            <span className={styles.dayDate}>{formatDayDate(day)}</span>
            <span
              className={`${styles.dayStat} ${allDayBookings.length > 0 && todayDay ? styles.dayStatActive : ''}`}
            >
              {allDayBookings.length > 0 ? visitCountLabel(allDayBookings.length) : '—'}
            </span>
            {holiday && <span className={styles.holidayBadge}>{holiday}</span>}
            {exception && (
              <span
                className={`${styles.exceptBadge} ${exception.isClosed ? styles.exceptBadgeClosed : styles.exceptBadgeModified}`}
                title={exception.reason}
              >
                {exception.isClosed
                  ? `Zamknięte`
                  : `Sk. godz. ${exception.customOpenTime ?? ''}–${exception.customCloseTime ?? ''}`}
              </span>
            )}
            {workersOnLeave.length > 0 && (
              <div className={styles.leavePills}>
                {workersOnLeave.map((w) => {
                  const leave = w.leaves.find(
                    (l) => iso >= l.startDate.slice(0, 10) && iso <= l.endDate.slice(0, 10),
                  )!;
                  const prefix = leavePrefix(leave.type);
                  return (
                    <span
                      key={w.id}
                      className={`${styles.leavePill} ${leavePillClass(leave.type)}`}
                      title={`${w.name}${leave.note ? `: ${leave.note}` : ''}`}
                    >
                      {prefix ? `${prefix}: ` : ''}
                      {w.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Grid body */}
        <div className={styles.dayCalBody}>
          <div className={styles.hourRail}>
            {HOURS.map((h) => (
              <div key={h} className={styles.hourCell}>{`${h}:00`}</div>
            ))}
          </div>

          <div
            className={`${styles.dayViewCol} ${todayDay ? styles.today : ''} ${isSunday ? styles.closed : ''}`}
          >
            <div
              data-calday={day.toISOString()}
              className={styles.dayColInner}
              style={{ height: `${GRID_HEIGHT}px` }}
              onMouseMove={
                !isSunday
                  ? (e) => {
                      if (dragRef.current) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const rawTop = e.clientY - rect.top;
                      setHoverTop(Math.min(Math.round(rawTop / 15) * 15, GRID_HEIGHT - 60));
                      setHoverTime(snapTimeFromOffset(rawTop));
                    }
                  : undefined
              }
              onMouseLeave={() => {
                if (!dragRef.current) setHoverTop(null);
              }}
              onClick={(e) => {
                if (!onSlotClick || isSunday || dragDisplay) return;
                const rect = e.currentTarget.getBoundingClientRect();
                onSlotClick(day, snapTimeFromOffset(e.clientY - rect.top), e.clientX, e.clientY);
              }}
            >
              {gridlines.map((top) => (
                <div key={top} className={styles.hourGridline} style={{ top: `${top}px` }} />
              ))}
              {!isSunday && !dragDisplay && hoverTop !== null && (
                <div className={styles.slotGhost} style={{ top: hoverTop }}>
                  <span className={styles.slotGhostLabel}>{hoverTime}</span>
                </div>
              )}
              {!isSunday && dragDisplay && (
                <div
                  className={styles.bookingDragGhost}
                  style={{ top: `${dragDisplay.top}px`, height: `${dragDisplay.height}px` }}
                >
                  <span className={styles.bookingDragGhostTime}>{dragDisplay.time}</span>
                  <span className={styles.bookingDragGhostName}>{dragDisplay.clientName}</span>
                </div>
              )}

              {isSunday && <span className={styles.closedMsg}>Niedziela · nieczynne</span>}

              {!isSunday &&
                tasks
                  .filter((t) => isSameDay(new Date(t.startAt), day))
                  .map((task) => (
                    <div
                      key={task.id}
                      className={styles.workerTask}
                      style={getBookingStyle(task.startAt, task.endAt)}
                      title={`${task.title}${task.workerName ? ` — ${task.workerName}` : ''} · ${formatTime(task.startAt)}–${formatTime(task.endAt)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Text
                        variant="nano"
                        as="span"
                        weight="bold"
                        className={styles.workerTaskTitle}
                      >
                        {task.title}
                      </Text>
                      {task.workerName && (
                        <Text
                          variant="nano"
                          as="span"
                          color="muted"
                          className={styles.workerTaskWorker}
                        >
                          {task.workerName}
                        </Text>
                      )}
                    </div>
                  ))}

              {!isSunday &&
                visibleBookings.map((booking) => {
                  const showPendingBadge = booking.status === 'PENDING';
                  const showProgressBadge = booking.status === 'IN_PROGRESS';
                  const metaParts: string[] = [];
                  if (booking.tireSize) metaParts.push(booking.tireSize);
                  if (booking.totalPricePln != null) metaParts.push(`${booking.totalPricePln} zł`);
                  return (
                    <div
                      key={booking.id}
                      role="button"
                      tabIndex={0}
                      className={[
                        styles.booking,
                        getStatusClass(booking.status),
                        isDraggable(booking.status) && onReschedule ? styles.bookingDraggable : '',
                        dragDisplay?.bookingId === booking.id ? styles.bookingDragging : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={getBookingStyle(booking.startAt, booking.endAt)}
                      title={`${booking.clientName} — ${formatTime(booking.startAt)} – ${formatTime(booking.endAt)}`}
                      onMouseDown={(e) => startBookingDrag(e, booking)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick?.(booking);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onBookingClick?.(booking);
                      }}
                    >
                      {(showPendingBadge || showProgressBadge) && (
                        <span className={styles.bookingBadge}>
                          {showProgressBadge ? 'W trakcie' : 'Oczekuje'}
                        </span>
                      )}
                      <span className={styles.bookingTime}>
                        {formatTime(booking.startAt)} – {formatTime(booking.endAt)}
                      </span>
                      <span className={styles.bookingClient}>{booking.clientName}</span>
                      {metaParts.length > 0 && (
                        <span className={styles.bookingMeta}>{metaParts.join(' · ')}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {nowLineVisible && (
            <div className={styles.nowLine} style={{ top: `${nowLineTop}px` }}>
              <span className={styles.nowLabel}>{nowTime}</span>
            </div>
          )}
        </div>

        {isLoading && (
          <div className={styles.loadingWrap}>
            <Spinner size="sm" label="Ładowanie rezerwacji…" />
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <aside className={styles.side} aria-label="Podsumowanie dnia">
        <section>
          <div className={styles.sideSecTitle}>
            Dzień
            <Text variant="kicker-sm" as="span" color="muted" className={styles.sideSecHint}>
              {formatDayDate(day)}
            </Text>
          </div>
          <div className={styles.weekStats}>
            <div className={`${styles.statBox} ${styles.statBoxAccent}`}>
              <div className={`${styles.statVal} ${styles.statValAccent}`}>
                {allDayBookings.length}
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
          </div>
        </section>

        <section>
          <div className={styles.sideSecTitle}>Filtry</div>
          <div className={styles.filterChips}>
            {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`${styles.filterChip} ${activeFilter === f ? styles.filterChipActive : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
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
              {pendingBookings.map((b, i) => (
                <span key={b.id}>
                  {i > 0 && ' '}
                  <Text variant="body-sm" as="span" weight="bold" color="primary">
                    {b.clientName}
                  </Text>{' '}
                  ({formatTime(b.startAt)}) czeka{' '}
                  <Text variant="kicker-sm" as="span" color="warning" weight="bold">
                    {timeAgo(b.createdAt)}
                  </Text>
                  .
                </span>
              ))}
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
          Widok dzienny pokazuje wizyty zaplanowane na ten dzień.
        </Text>
      </aside>
    </div>
  );
}
