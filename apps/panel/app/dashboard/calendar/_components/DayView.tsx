'use client';

import { useState } from 'react';
import { Spinner, Text } from '@opony/design-system-web';
import type { Booking, BookingStatus } from '../../../../api-data-access/bookings';
import { IconInfo, IconArrowRight } from '../../../../components/icons';
import {
  HOURS,
  PX_PER_HOUR,
  GRID_HEIGHT,
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
} from '../calendar.utils';
import styles from '../calendar.module.css';

interface DayViewProps {
  day: Date;
  bookings: Booking[];
  isLoading: boolean;
  nowLineTop: number;
  nowTime: string;
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

export function DayView({ day, bookings, isLoading, nowLineTop, nowTime }: DayViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

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
            <div className={styles.dayColInner} style={{ height: `${GRID_HEIGHT}px` }}>
              {gridlines.map((top) => (
                <div key={top} className={styles.hourGridline} style={{ top: `${top}px` }} />
              ))}

              {isSunday && <span className={styles.closedMsg}>Niedziela · nieczynne</span>}

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
                      className={`${styles.booking} ${getStatusClass(booking.status)}`}
                      style={getBookingStyle(booking.startAt, booking.endAt)}
                      title={`${booking.clientName} — ${formatTime(booking.startAt)} – ${formatTime(booking.endAt)}`}
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
