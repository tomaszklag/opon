'use client';

import { useEffect, useState } from 'react';
import { Button, Spinner } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useBookings } from '../../../lib/hooks/use-bookings';
import type { Booking, BookingStatus } from '../../../api-data-access/bookings';
import {
  IconChevronLeft,
  IconChevronRight,
  IconInfo,
  IconArrowRight,
  IconDownload,
  IconPlus,
} from '../../../components/icons';
import styles from './calendar.module.css';

// ── Constants ────────────────────────────────────────────────────────────────

const HOUR_START = 8;
const HOUR_END = 18;
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const PX_PER_HOUR = 60;
const GRID_HEIGHT = (HOUR_END - HOUR_START + 1) * PX_PER_HOUR; // 660px — 11 hours × 60px (8:00–18:00 inclusive)

const DAY_ABBR = ['ND', 'PON', 'WT', 'ŚR', 'CZ', 'PT', 'SB'];

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, …
  const diff = day === 0 ? -6 : 1 - day; // offset to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekStart(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function formatDayDate(date: Date): string {
  const monthName = MONTH_NAMES_GEN[date.getMonth()] ?? 'sty';
  return `${date.getDate()} ${monthName.slice(0, 3).toLowerCase()}`;
}

function getBookingStyle(startAt: string, endAt: string): { top: string; height: string } {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const topPx = startMinutes - HOUR_START * 60;
  const heightPx = endMinutes - startMinutes;
  return {
    top: `${topPx}px`,
    height: `${Math.max(heightPx, 20)}px`,
  };
}

function getNowLineTop(): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes - HOUR_START * 60;
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
      // CANCELLED_BY_CLIENT, CANCELLED_BY_PROVIDER, CANCELLED_BY_SYSTEM, NO_SHOW, REJECTED
      return `${styles.completed ?? ''} ${styles.past ?? ''}`;
  }
}

function isCancelledOrDone(status: BookingStatus): boolean {
  return [
    'CANCELLED_BY_CLIENT',
    'CANCELLED_BY_PROVIDER',
    'CANCELLED_BY_SYSTEM',
    'NO_SHOW',
    'REJECTED',
  ].includes(status);
}

function timeAgo(isoString: string): string {
  const created = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h}h ${m} min` : `${h}h`;
}

function buildWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

// ── Filter types ─────────────────────────────────────────────────────────────

type FilterType = 'all' | 'confirmed' | 'pending' | 'completed';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Wszystkie',
  confirmed: 'Potwierdzone',
  pending: 'Oczekujące',
  completed: 'Zakończone',
};

function matchesFilter(booking: Booking, filter: FilterType): boolean {
  if (filter === 'all') return true;
  if (filter === 'confirmed')
    return booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS';
  if (filter === 'pending') return booking.status === 'PENDING';
  if (filter === 'completed')
    return booking.status === 'COMPLETED' || isCancelledOrDone(booking.status);
  return true;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [nowLineTop, setNowLineTop] = useState<number>(getNowLineTop);
  const [nowTime, setNowTime] = useState<string>(() => formatTime(new Date().toISOString()));
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const weekStartStr = formatWeekStart(weekStart);
  const { bookings, isLoading } = useBookings(weekStartStr);

  // Update now-line every minute
  useEffect(() => {
    const id = setInterval(() => {
      setNowLineTop(getNowLineTop());
      setNowTime(formatTime(new Date().toISOString()));
    }, 1000 * 60);
    return () => clearInterval(id);
  }, []);

  function goToPrevWeek() {
    setWeekStart((d) => addDays(d, -7));
  }

  function goToNextWeek() {
    setWeekStart((d) => addDays(d, 7));
  }

  function goToToday() {
    setWeekStart(getWeekStart(new Date()));
  }

  if (authLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie kalendarza…" />
      </div>
    );
  }

  const weekDays = buildWeekDays(weekStart);
  const weekEnd = weekDays[6]!;
  const weekNum = getWeekNumber(weekStart);
  const year = weekStart.getFullYear();

  // Week range label e.g. "14 – 20 KWIETNIA"
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const startMonth = (MONTH_NAMES_GEN[weekStart.getMonth()] ?? 'Styczeń').toUpperCase();
  const endMonth = (MONTH_NAMES_GEN[weekEnd.getMonth()] ?? 'Styczeń').toUpperCase();
  const weekRangeLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${startDay} – ${endDay} ${startMonth}`
      : `${startDay} ${startMonth} – ${endDay} ${endMonth}`;

  // Filtered bookings for display
  const filteredBookings = bookings.filter((b) => matchesFilter(b, activeFilter));

  // Bookings per day (filtered)
  function getDayBookings(day: Date): Booking[] {
    return filteredBookings.filter((b) => isSameDay(new Date(b.startAt), day));
  }

  // Booking counts from full (unfiltered) set
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS',
  ).length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  // Pending bookings for the alert card
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');

  // Show now-line only if current week
  const isCurrentWeek = isSameDay(weekStart, getWeekStart(new Date()));
  const nowLineVisible = isCurrentWeek && nowLineTop >= 0 && nowLineTop <= GRID_HEIGHT;

  // Gridlines: every 60px (each hour after start)
  const gridlines = HOURS.slice(1).map((_, i) => (i + 1) * PX_PER_HOUR);

  return (
    <main className={styles.main}>
      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        {/* Breadcrumb via DS Text omitted — layout.tsx topbar already shows it */}
        {/* View switcher */}
        <div className={styles.viewSwitcher} role="tablist">
          <button className={styles.viewBtn} role="tab" type="button">
            Dzień
          </button>
          <button
            className={`${styles.viewBtn} ${styles.viewBtnActive}`}
            role="tab"
            type="button"
            aria-selected="true"
          >
            Tydzień
          </button>
          <button className={styles.viewBtn} role="tab" type="button">
            Miesiąc
          </button>
        </div>

        <span style={{ width: 20 }} />

        {/* Date navigation */}
        <div className={styles.dateNav}>
          <button
            className={styles.dateNavBtn}
            type="button"
            aria-label="Poprzedni tydzień"
            onClick={goToPrevWeek}
          >
            <IconChevronLeft width="14" height="14" />
          </button>
          <div className={styles.dateNavRange}>
            <span className={styles.dateNavMain}>{weekRangeLabel}</span>
            <span className={styles.dateNavSub}>
              Tydzień {weekNum} · {year}
            </span>
          </div>
          <button
            className={styles.dateNavBtn}
            type="button"
            aria-label="Następny tydzień"
            onClick={goToNextWeek}
          >
            <IconChevronRight width="14" height="14" />
          </button>
          <button className={styles.todayBtn} type="button" onClick={goToToday}>
            Dziś
          </button>
        </div>

        <div className={styles.topbarSpacer} />

        <Button variant="ghost" size="sm">
          <IconDownload width="13" height="13" />
          Eksport .ics
        </Button>
        <Button variant="primary" size="sm">
          <IconPlus width="13" height="13" />
          Wizyta ręczna
        </Button>
      </header>

      {/* ── Content ── */}
      <div className={styles.content}>
        {/* ── Calendar ── */}
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
                    {dayBookingCount > 0
                      ? `${dayBookingCount} ${dayBookingCount === 1 ? 'wizyta' : dayBookingCount < 5 ? 'wizyty' : 'wizyt'}`
                      : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid body */}
          <div className={styles.calBody}>
            {/* Hour rail */}
            <div className={styles.hourRail}>
              {HOURS.map((h) => (
                <div key={h} className={styles.hourCell}>
                  {`${h}:00`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const todayDay = isToday(day);
              const isSunday = day.getDay() === 0;
              const dayBookings = getDayBookings(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`${styles.dayCol} ${todayDay ? styles.today : ''} ${isSunday ? styles.closed : ''}`}
                >
                  <div className={styles.dayColInner} style={{ height: `${GRID_HEIGHT}px` }}>
                    {/* Gridlines */}
                    {gridlines.map((top) => (
                      <div key={top} className={styles.hourGridline} style={{ top: `${top}px` }} />
                    ))}

                    {/* Closed Sunday message */}
                    {isSunday && <span className={styles.closedMsg}>Niedziela · nieczynne</span>}

                    {/* Booking blocks */}
                    {!isSunday &&
                      dayBookings.map((booking) => {
                        const posStyle = getBookingStyle(booking.startAt, booking.endAt);
                        const statusClass = getStatusClass(booking.status);
                        const showPendingBadge = booking.status === 'PENDING';
                        const showProgressBadge = booking.status === 'IN_PROGRESS';
                        const metaParts: string[] = [];
                        if (booking.tireSize) metaParts.push(booking.tireSize);
                        if (booking.totalPricePln != null)
                          metaParts.push(`${booking.totalPricePln} zł`);
                        const metaText = metaParts.join(' · ');

                        return (
                          <div
                            key={booking.id}
                            className={`${styles.booking} ${statusClass}`}
                            style={posStyle}
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
                            {metaText && <span className={styles.bookingMeta}>{metaText}</span>}
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}

            {/* Current time indicator */}
            {nowLineVisible && (
              <div className={styles.nowLine} style={{ top: `${nowLineTop}px` }}>
                <span className={styles.nowLabel}>{nowTime}</span>
              </div>
            )}
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className={styles.loadingWrap}>
              <Spinner size="sm" label="Ładowanie rezerwacji…" />
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <aside className={styles.side} aria-label="Podsumowanie tygodnia i filtry">
          {/* Week stats */}
          <section>
            <div className={styles.sideSecTitle}>
              Tydzień
              <span className={styles.sideSecHint}>
                {weekNum} / {year}
              </span>
            </div>
            <div className={styles.weekStats}>
              <div className={`${styles.statBox} ${styles.statBoxAccent}`}>
                <div className={`${styles.statVal} ${styles.statValAccent}`}>
                  {totalCount}
                  <span className={styles.statUnit}>wizyt</span>
                </div>
                <div className={styles.statLbl}>Razem</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statVal}>
                  {confirmedCount}
                  <span className={styles.statUnit}>✓</span>
                </div>
                <div className={styles.statLbl}>Potwierdzone</div>
              </div>
              <div className={styles.statBox}>
                <div className={`${styles.statVal} ${styles.statValWarn}`}>
                  {pendingCount}
                  <span className={styles.statUnit}>⚠</span>
                </div>
                <div className={styles.statLbl}>Oczekują akceptacji</div>
              </div>
              <div className={styles.statBox}>
                <div className={`${styles.statVal} ${styles.statValSuccess}`}>
                  {completedCount}
                  <span className={styles.statUnit}>✓</span>
                </div>
                <div className={styles.statLbl}>Zakończone</div>
              </div>
            </div>
          </section>

          {/* Legend */}
          <section>
            <div className={styles.sideSecTitle}>Legenda</div>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendSwatchConfirmed}`} />
                <span>Potwierdzona</span>
                <span className={styles.legendCount}>{confirmedCount}</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendSwatchPending}`} />
                <span>Oczekuje</span>
                <span className={styles.legendCount}>{pendingCount}</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendSwatchProgress}`} />
                <span>W trakcie</span>
                <span className={styles.legendCount}>
                  {bookings.filter((b) => b.status === 'IN_PROGRESS').length}
                </span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendSwatchCompleted}`} />
                <span>Zakończona</span>
                <span className={styles.legendCount}>{completedCount}</span>
              </div>
            </div>
          </section>

          {/* Filter chips */}
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

          {/* Pending alert */}
          {pendingBookings.length > 0 && (
            <section className={styles.pendingCard}>
              <div className={styles.pendingHead}>
                <span className={styles.pendingIcon} aria-hidden="true">
                  <IconInfo width="14" height="14" />
                </span>
                <span className={styles.pendingTitle}>
                  {pendingBookings.length}{' '}
                  {pendingBookings.length === 1 ? 'rezerwacja czeka' : 'rezerwacje czekają'}
                </span>
              </div>
              <div className={styles.pendingBody}>
                {pendingBookings.map((b, i) => {
                  const visitDay = isSameDay(new Date(b.startAt), new Date())
                    ? 'dziś'
                    : formatDayDate(new Date(b.startAt));
                  return (
                    <span key={b.id}>
                      {i > 0 && ' '}
                      <span className={styles.pendingBodyStrong}>{b.clientName}</span> ({visitDay}{' '}
                      {formatTime(b.startAt)}) czeka{' '}
                      <span className={styles.pendingBodyEm}>{timeAgo(b.createdAt)}</span>.
                    </span>
                  );
                })}
              </div>
              <button className={styles.pendingCta} type="button">
                <IconArrowRight width="12" height="12" />
                Przejrzyj teraz
              </button>
            </section>
          )}

          {/* Tip */}
          <div className={styles.calFootHint}>
            <span className={styles.calFootHintStrong}>Tip:</span> Kliknij wizytę, aby zobaczyć
            szczegóły. Rezerwacje oczekujące wymagają potwierdzenia przed wizytą klienta.
          </div>
        </aside>
      </div>
    </main>
  );
}
