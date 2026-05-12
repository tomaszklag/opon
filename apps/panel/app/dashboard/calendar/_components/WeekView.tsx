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
  getWeekStart,
  buildWeekDays,
  isSameDay,
  isToday,
  formatTime,
  formatDayDate,
  getBookingStyle,
  isCancelledOrDone,
  timeAgo,
  matchesFilter,
  visitCountLabel,
  toISODate,
  snapTimeFromOffset,
} from '../calendar.utils';
import styles from '../calendar.module.css';

interface WeekViewProps {
  weekStart: Date;
  weekNum: number;
  year: number;
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

interface DragDisplay {
  bookingId: string;
  dayKey: string;
  top: number;
  height: number;
  time: string;
  clientName: string;
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

export function WeekView({
  weekStart,
  weekNum,
  year,
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
}: WeekViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoverInfo, setHoverInfo] = useState<{ dayKey: string; top: number; time: string } | null>(
    null,
  );
  const [dragDisplay, setDragDisplay] = useState<DragDisplay | null>(null);
  const dragRef = useRef<{ booking: Booking; grabOffsetY: number; heightPx: number } | null>(null);
  const dragDisplayRef = useRef<DragDisplay | null>(null);
  dragDisplayRef.current = dragDisplay;

  function handleColumnMouseMove(e: React.MouseEvent<HTMLDivElement>, day: Date) {
    if (dragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawTop = e.clientY - rect.top;
    const snappedTop = Math.min(Math.round(rawTop / 15) * 15, GRID_HEIGHT - 60);
    const time = snapTimeFromOffset(rawTop);
    setHoverInfo({ dayKey: day.toISOString(), top: snappedTop, time });
  }

  function startBookingDrag(e: React.MouseEvent, booking: Booking, day: Date) {
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
    const initTop = startMins - HOUR_START * 60;

    dragRef.current = { booking, grabOffsetY, heightPx };
    const initDisplay: DragDisplay = {
      bookingId: booking.id,
      dayKey: day.toISOString(),
      top: initTop,
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
      const time = snapTimeFromOffset(snappedTop);
      const dayKey = colEl.getAttribute('data-calday') ?? '';
      const next: DragDisplay = {
        bookingId: drag.booking.id,
        dayKey,
        top: snappedTop,
        height: drag.heightPx,
        time,
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
      setHoverInfo(null);

      if (!drag || !display) return;

      const targetDay = weekDays.find((d) => d.toISOString() === display.dayKey);
      if (!targetDay) return;

      const origTime = formatTime(drag.booking.startAt);
      const origDayKey = weekDays
        .find((d) => isSameDay(new Date(drag.booking.startAt), d))
        ?.toISOString();
      const unchanged = origDayKey === display.dayKey && display.time === origTime;
      if (!unchanged) {
        onReschedule?.(drag.booking, targetDay, display.time);
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const weekDays = buildWeekDays(weekStart);
  const isCurrentWeek = isSameDay(weekStart, getWeekStart(new Date()));
  const nowLineVisible = isCurrentWeek && nowLineTop >= 0 && nowLineTop <= GRID_HEIGHT;
  const gridlines = HOURS.slice(1).map((_, i) => (i + 1) * PX_PER_HOUR);

  const filteredBookings = bookings.filter((b) => matchesFilter(b, activeFilter));

  function getDayBookings(day: Date): Booking[] {
    return filteredBookings.filter((b) => isSameDay(new Date(b.startAt), day));
  }

  function getDayTasks(day: Date): WorkerTask[] {
    return tasks.filter((t) => isSameDay(new Date(t.startAt), day));
  }

  // Stats (unfiltered)
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS',
  ).length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');

  return (
    <div className={styles.content}>
      {/* ── Calendar grid ── */}
      <div className={styles.calContainer}>
        {/* Day header row */}
        <div className={styles.dayHeader}>
          <div className={styles.dayHeaderTz}>CET</div>
          {weekDays.map((day) => {
            const todayDay = isToday(day);
            const isSunday = day.getDay() === 0;
            const dayBookingCount = bookings.filter((b) =>
              isSameDay(new Date(b.startAt), day),
            ).length;
            const iso = toISODate(day);
            const holiday = HOLIDAY_MAP.get(iso);
            const exception = exceptions.find((e) => e.date.slice(0, 10) === iso);
            const workersOnLeave = workers.filter((w) =>
              w.leaves.some(
                (l) => iso >= l.startDate.slice(0, 10) && iso <= l.endDate.slice(0, 10),
              ),
            );
            return (
              <div
                key={day.toISOString()}
                className={`${styles.dayColHead} ${todayDay ? styles.today : ''} ${isSunday ? styles.closed : ''}`}
              >
                {todayDay && <span className={styles.todayBadge}>Dziś</span>}
                <span className={styles.dayAbbr}>{DAY_ABBR[day.getDay()]}</span>
                <span className={styles.dayDate}>{formatDayDate(day)}</span>
                <span
                  className={`${styles.dayStat} ${dayBookingCount > 0 && todayDay ? styles.dayStatActive : ''}`}
                >
                  {dayBookingCount > 0 ? visitCountLabel(dayBookingCount) : '—'}
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
            );
          })}
        </div>

        {/* Grid body */}
        <div className={styles.calBody}>
          <div className={styles.hourRail}>
            {HOURS.map((h) => (
              <div key={h} className={styles.hourCell}>{`${h}:00`}</div>
            ))}
          </div>

          {weekDays.map((day) => {
            const todayDay = isToday(day);
            const isSunday = day.getDay() === 0;
            const dayBookings = getDayBookings(day);
            return (
              <div
                key={day.toISOString()}
                className={`${styles.dayCol} ${todayDay ? styles.today : ''} ${isSunday ? styles.closed : ''}`}
              >
                <div
                  data-calday={day.toISOString()}
                  className={styles.dayColInner}
                  style={{ height: `${GRID_HEIGHT}px` }}
                  onMouseMove={!isSunday ? (e) => handleColumnMouseMove(e, day) : undefined}
                  onMouseLeave={() => {
                    if (!dragRef.current) setHoverInfo(null);
                  }}
                  onClick={(e) => {
                    if (!onSlotClick || isSunday || dragDisplay) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    onSlotClick(
                      day,
                      snapTimeFromOffset(e.clientY - rect.top),
                      e.clientX,
                      e.clientY,
                    );
                  }}
                >
                  {gridlines.map((top) => (
                    <div key={top} className={styles.hourGridline} style={{ top: `${top}px` }} />
                  ))}
                  {!isSunday && !dragDisplay && hoverInfo?.dayKey === day.toISOString() && (
                    <div className={styles.slotGhost} style={{ top: hoverInfo.top }}>
                      <span className={styles.slotGhostLabel}>{hoverInfo.time}</span>
                    </div>
                  )}
                  {!isSunday && dragDisplay?.dayKey === day.toISOString() && (
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
                    getDayTasks(day).map((task) => (
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
                    dayBookings.map((booking) => {
                      const showPendingBadge = booking.status === 'PENDING';
                      const showProgressBadge = booking.status === 'IN_PROGRESS';
                      const metaParts: string[] = [];
                      if (booking.tireSize) metaParts.push(booking.tireSize);
                      if (booking.totalPricePln != null)
                        metaParts.push(`${booking.totalPricePln} zł`);
                      return (
                        <div
                          key={booking.id}
                          role="button"
                          tabIndex={0}
                          className={[
                            styles.booking,
                            getStatusClass(booking.status),
                            isDraggable(booking.status) && onReschedule
                              ? styles.bookingDraggable
                              : '',
                            dragDisplay?.bookingId === booking.id ? styles.bookingDragging : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={getBookingStyle(booking.startAt, booking.endAt)}
                          title={`${booking.clientName} — ${formatTime(booking.startAt)} – ${formatTime(booking.endAt)}`}
                          onMouseDown={(e) => startBookingDrag(e, booking, day)}
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
            );
          })}

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
      <aside className={styles.side} aria-label="Podsumowanie tygodnia i filtry">
        <section>
          <div className={styles.sideSecTitle}>
            Tydzień
            <Text variant="kicker-sm" as="span" color="muted" className={styles.sideSecHint}>
              {weekNum} / {year}
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
                Oczekują akceptacji
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
                {bookings.filter((b) => b.status === 'IN_PROGRESS').length}
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
          Kliknij wizytę, aby zobaczyć szczegóły. Rezerwacje oczekujące wymagają potwierdzenia przed
          wizytą klienta.
        </Text>
      </aside>
    </div>
  );
}
