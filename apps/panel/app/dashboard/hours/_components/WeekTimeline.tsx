import { Fragment } from 'react';
import { Heading, Text } from '@opony/design-system-web';
import { type DayEntry } from '../../../../lib/hooks/use-working-hours';
import { getUpcomingHolidays, PL_HOLIDAYS } from '../../../../lib/holidays';
import { DAY_META, parseTime, computeSlotsForDay, formatDuration } from './utils';
import styles from '../hours.module.css';

interface Props {
  days: DayEntry[];
  defaultSlotMinutes: number;
  todayDow: number;
}

function computeWeekSummary(days: DayEntry[], defaultSlotMinutes: number) {
  let totalMinutes = 0;
  let totalSlots = 0;
  const overrides: { abbr: string; slotMinutes: number; slots: number }[] = [];

  for (const day of days) {
    if (day.isClosed) continue;
    const [oh, om] = parseTime(day.openTime);
    const [ch, cm] = parseTime(day.closeTime);
    const mins = ch * 60 + cm - (oh * 60 + om);
    if (mins > 0) {
      totalMinutes += mins;
      const slots = computeSlotsForDay(day);
      totalSlots += slots;
      if (day.slotMinutes !== defaultSlotMinutes) {
        const meta = DAY_META[day.dayOfWeek];
        if (meta) overrides.push({ abbr: meta.abbr, slotMinutes: day.slotMinutes, slots });
      }
    }
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  return { totalHours, totalSlots, overrides };
}

function formatDateLabel(iso: string): string {
  const [, m, d] = iso.split('-');
  const months = [
    'sty',
    'lut',
    'mar',
    'kwi',
    'maj',
    'cze',
    'lip',
    'sie',
    'wrz',
    'paź',
    'lis',
    'gru',
  ];
  return `${parseInt(d ?? '1')} ${months[parseInt(m ?? '1') - 1] ?? ''}`;
}

export function WeekTimeline({ days, defaultSlotMinutes, todayDow }: Props) {
  const upcoming = getUpcomingHolidays(4);
  const { totalHours, totalSlots, overrides } = computeWeekSummary(days, defaultSlotMinutes);

  return (
    <aside className={styles.previewCol}>
      {/* Weekly timeline */}
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <Heading variant="section" as="h3">
            Twój tydzień
          </Heading>
          <Text variant="nano" as="span" color="muted">
            wg bieżących ustawień
          </Text>
        </div>

        <div className={styles.timeline}>
          {days.map((day) => {
            const meta = DAY_META[day.dayOfWeek] ?? { abbr: '?', full: '?' };
            const isToday = day.dayOfWeek === todayDow;

            const openPct = day.isClosed
              ? 0
              : (() => {
                  const [h, m] = parseTime(day.openTime);
                  return ((h * 60 + m) / (24 * 60)) * 100;
                })();

            const widthPct = day.isClosed
              ? 0
              : (() => {
                  const [oh, om] = parseTime(day.openTime);
                  const [ch, cm] = parseTime(day.closeTime);
                  return Math.max(0, ((ch * 60 + cm - (oh * 60 + om)) / (24 * 60)) * 100);
                })();

            return (
              <div
                key={day.dayOfWeek}
                className={[
                  styles.tlDay,
                  isToday ? styles.tlDayToday : '',
                  day.isClosed ? styles.tlDayClosed : '',
                ].join(' ')}
              >
                <Text
                  variant="nano"
                  as="span"
                  weight="bold"
                  color={isToday ? 'accent' : 'secondary'}
                  className={styles.tlDayLabel}
                >
                  {meta.abbr}
                </Text>
                <div
                  className={[styles.tlBarWrap, day.isClosed ? styles.tlBarClosed : ''].join(' ')}
                >
                  <div
                    className={styles.tlBarFill}
                    style={{ left: `${openPct}%`, width: `${widthPct}%` }}
                  />
                </div>
                <Text
                  variant="nano"
                  as="span"
                  mono
                  weight="bold"
                  color={day.isClosed ? 'muted' : isToday ? 'accent' : undefined}
                  className={styles.tlDayHours}
                >
                  {day.isClosed ? '—' : `${day.openTime}–${day.closeTime}`}
                </Text>
              </div>
            );
          })}
        </div>

        <div className={styles.previewSummary}>
          <div className={styles.statBox}>
            <Text variant="body-md" as="span" mono weight="bold">
              {totalHours}
              <Text variant="nano" as="span" color="accent" className={styles.statUnit}>
                {' '}
                h
              </Text>
            </Text>
            <Text variant="nano" as="p" color="muted">
              tygodniowo
            </Text>
          </div>
          <div className={styles.statBox}>
            <Text variant="body-md" as="span" mono weight="bold">
              {totalSlots}
              <Text variant="nano" as="span" color="accent" className={styles.statUnit}>
                {' '}
                sl.
              </Text>
            </Text>
            <Text variant="nano" as="p" color="muted">
              na tydzień
            </Text>
          </div>
        </div>

        {overrides.length > 0 && (
          <Text variant="nano" as="p" color="muted">
            {overrides.map((o) => (
              <Fragment key={o.abbr}>
                <Text variant="nano" as="span" color="accent" weight="bold">
                  {o.abbr}
                </Text>
                {`: ${o.slotMinutes} min (${o.slots} sl.) · `}
              </Fragment>
            ))}
            reszta {defaultSlotMinutes} min
          </Text>
        )}
      </div>

      {/* Upcoming closures */}
      {upcoming.length > 0 && (
        <div className={styles.previewPanel}>
          <div className={styles.previewHead}>
            <Heading variant="section" as="h3">
              Najbliższe zamknięcia
            </Heading>
            <Text variant="nano" as="span" color="muted">
              {upcoming.length} / {PL_HOLIDAYS.length}
            </Text>
          </div>
          <div className={styles.upcomingList}>
            {upcoming.map((h) => (
              <div key={h.date} className={styles.upcomingItem}>
                <Text variant="nano" as="span" mono weight="bold" className={styles.upcomingDate}>
                  {formatDateLabel(h.date)}
                </Text>
                <Text variant="body-sm" as="span" color="secondary">
                  <strong>{h.name}</strong> · święto
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
