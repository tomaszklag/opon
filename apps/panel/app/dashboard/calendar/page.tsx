'use client';

import { useEffect, useState } from 'react';
import { Button, Heading, SegmentedControl, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useBookings } from '../../../lib/hooks/use-bookings';
import { useBookingsMonth } from '../../../lib/hooks/use-bookings-month';
import { useWorkerTasks } from '../../../lib/hooks/use-worker-tasks';
import { IconChevronLeft, IconChevronRight } from '../../../components/icons';
import { ManualBookingModal } from '../_components/ManualBookingModal';
import { WorkerTaskModal } from '../_components/WorkerTaskModal';
import {
  CalendarView,
  getWeekStart,
  formatWeekStart,
  addDays,
  addMonths,
  buildWeekDays,
  buildMonthGrid,
  getWeekNumber,
  getNowLineTop,
  formatTime,
  MONTH_NAMES_GEN,
  MONTH_NAMES,
  DAY_NAMES_FULL,
} from './calendar.utils';
import { WeekView } from './_components/WeekView';
import { DayView } from './_components/DayView';
import { MonthView } from './_components/MonthView';
import { BookingTopbarActions } from '../_components/BookingTopbarActions';
import styles from './calendar.module.css';

export default function CalendarPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');

  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [nowLineTop, setNowLineTop] = useState<number>(getNowLineTop);
  const [nowTime, setNowTime] = useState<string>(() => formatTime(new Date().toISOString()));
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Week/day data — disabled in month view
  const weekStart = getWeekStart(currentDate);
  const weekStartStr = view !== 'month' ? formatWeekStart(weekStart) : null;
  const { bookings, isLoading, mutate } = useBookings(weekStartStr);
  const { tasks, mutate: mutateTasks } = useWorkerTasks(weekStartStr);

  // Month data — parallel SWR per week, disabled outside month view
  const monthWeekStarts =
    view === 'month' ? buildMonthGrid(currentDate).map((w) => formatWeekStart(w[0]!)) : [];
  const { bookings: monthBookings, isLoading: monthLoading } = useBookingsMonth(monthWeekStarts);

  useEffect(() => {
    const id = setInterval(() => {
      setNowLineTop(getNowLineTop());
      setNowTime(formatTime(new Date().toISOString()));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  function goToPrev() {
    if (view === 'month') {
      setCurrentDate((d) => addMonths(d, -1));
    } else {
      setCurrentDate((d) => addDays(d, view === 'day' ? -1 : -7));
    }
  }
  function goToNext() {
    if (view === 'month') {
      setCurrentDate((d) => addMonths(d, 1));
    } else {
      setCurrentDate((d) => addDays(d, view === 'day' ? 1 : 7));
    }
  }
  function goToToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentDate(today);
  }

  if (authLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie kalendarza…" />
      </div>
    );
  }

  // ── Topbar date labels ──────────────────────────────────────────────────────
  let dateNavMain: string;
  let dateNavSub: string;
  let prevLabel: string;
  let nextLabel: string;

  if (view === 'week') {
    const weekDays = buildWeekDays(weekStart);
    const weekEnd = weekDays[6]!;
    const weekNum = getWeekNumber(weekStart);
    const year = weekStart.getFullYear();
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const startMonth = (MONTH_NAMES_GEN[weekStart.getMonth()] ?? 'Styczeń').toUpperCase();
    const endMonth = (MONTH_NAMES_GEN[weekEnd.getMonth()] ?? 'Styczeń').toUpperCase();
    dateNavMain =
      weekStart.getMonth() === weekEnd.getMonth()
        ? `${startDay} – ${endDay} ${startMonth}`
        : `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
    dateNavSub = `Tydzień ${weekNum} · ${year}`;
    prevLabel = 'Poprzedni tydzień';
    nextLabel = 'Następny tydzień';
  } else if (view === 'month') {
    dateNavMain = (MONTH_NAMES[currentDate.getMonth()] ?? '').toUpperCase();
    dateNavSub = String(currentDate.getFullYear());
    prevLabel = 'Poprzedni miesiąc';
    nextLabel = 'Następny miesiąc';
  } else {
    const dayName = DAY_NAMES_FULL[currentDate.getDay()] ?? '';
    const month = (MONTH_NAMES_GEN[currentDate.getMonth()] ?? '').toUpperCase();
    dateNavMain = `${dayName}, ${currentDate.getDate()} ${month}`;
    dateNavSub = String(currentDate.getFullYear());
    prevLabel = 'Poprzedni dzień';
    nextLabel = 'Następny dzień';
  }

  const weekNum = getWeekNumber(weekStart);
  const year = weekStart.getFullYear();

  return (
    <main className={styles.main}>
      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <SegmentedControl
          options={[
            { value: 'day', label: 'Dzień' },
            { value: 'week', label: 'Tydzień' },
            { value: 'month', label: 'Miesiąc' },
          ]}
          value={view}
          onChange={(v) => setView(v as CalendarView)}
          name="calendar-view"
        />

        <span style={{ width: 20 }} />

        <div className={styles.dateNav}>
          <Button variant="neutral" size="sm" iconOnly aria-label={prevLabel} onClick={goToPrev}>
            <IconChevronLeft width="14" height="14" />
          </Button>
          <div className={styles.dateNavRange}>
            <Heading variant="subsection" as="span">
              {dateNavMain}
            </Heading>
            <Text variant="kicker-sm" as="span" color="muted" className={styles.dateNavSub}>
              {dateNavSub}
            </Text>
          </div>
          <Button variant="neutral" size="sm" iconOnly aria-label={nextLabel} onClick={goToNext}>
            <IconChevronRight width="14" height="14" />
          </Button>
          <Button variant="secondary" size="sm" className={styles.todayBtn} onClick={goToToday}>
            Dziś
          </Button>
        </div>

        <div className={styles.topbarSpacer} />

        <BookingTopbarActions
          exportLabel="Eksport .ics"
          onAdd={() => setIsManualOpen(true)}
          onAddTask={() => setIsTaskModalOpen(true)}
        />
      </header>

      {/* ── View ── */}
      {view === 'week' && (
        <WeekView
          weekStart={weekStart}
          weekNum={weekNum}
          year={year}
          bookings={bookings}
          tasks={tasks}
          isLoading={isLoading}
          nowLineTop={nowLineTop}
          nowTime={nowTime}
        />
      )}
      {view === 'day' && (
        <DayView
          day={currentDate}
          bookings={bookings}
          tasks={tasks}
          isLoading={isLoading}
          nowLineTop={nowLineTop}
          nowTime={nowTime}
        />
      )}
      {view === 'month' && (
        <MonthView month={currentDate} bookings={monthBookings} isLoading={monthLoading} />
      )}

      <ManualBookingModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={() => mutate()}
      />
      <WorkerTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => {
          void mutateTasks();
        }}
        weekStart={weekStartStr ?? ''}
      />
    </main>
  );
}
