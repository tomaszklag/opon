'use client';

import { Spinner, Text } from '@opony/design-system-web';
import type { Booking, BookingStatus } from '../../../../api-data-access/bookings';
import type { ScheduleException } from '../../../../api-data-access/schedule-exceptions';
import { IconInfo, IconArrowRight } from '../../../../components/icons';
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
  exceptions: ScheduleException[];
  isLoading: boolean;
  onBookingClick?: (booking: Booking) => void;
  onSlotClick?: (date: Date, time: string, x: number, y: number) => void;
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
  exceptions,
  isLoading,
  onBookingClick,
  onSlotClick,
}: MonthViewProps) {
  const grid = buildMonthGrid(month);

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
            const visible = dayBookings.slice(0, MAX_CHIPS);
            const overflow = dayBookings.length - MAX_CHIPS;

            const iso = toISODate(day);
            const holiday = HOLIDAY_MAP.get(iso);
            const exception = exceptions.find((e) => e.date.slice(0, 10) === iso);

            const isInteractive = !isSunday && !isOutOfMonth;
            return (
              <div
                key={day.toISOString()}
                className={[
                  styles.monthCell,
                  todayDay ? styles.monthCellToday : '',
                  isOutOfMonth ? styles.monthCellOuter : '',
                  isSunday ? styles.monthCellSunday : '',
                  isInteractive ? styles.monthCellInteractive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={
                  isInteractive
                    ? (e) => {
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

                {!isSunday &&
                  visible.map((b) => (
                    <div
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      className={`${styles.monthBookingChip} ${getChipClass(b.status)}`}
                      style={{ cursor: 'pointer' }}
                      title={`${b.clientName} — ${formatTime(b.startAt)} – ${formatTime(b.endAt)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick?.(b);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onBookingClick?.(b);
                      }}
                    >
                      <span className={styles.monthChipTime}>{formatTime(b.startAt)}</span>
                      <span className={styles.monthChipName}>{b.clientName}</span>
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
