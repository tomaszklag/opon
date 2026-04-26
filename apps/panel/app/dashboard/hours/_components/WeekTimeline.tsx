import { type DayEntry } from '../../../../lib/hooks/use-working-hours';
import { DAY_META, parseTime } from './utils';
import styles from '../hours.module.css';

interface Props {
  days: DayEntry[];
  todayDow: number;
}

export function WeekTimeline({ days, todayDow }: Props) {
  return (
    <aside className={styles.previewCol}>
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <span className={styles.previewTitle}>Podgląd tygodnia</span>
          <span className={styles.previewSub}>wg bieżących ustawień</span>
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
                  const mins = ch * 60 + cm - (oh * 60 + om);
                  return Math.max(0, (mins / (24 * 60)) * 100);
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
                <span className={styles.tlDayLabel}>{meta.abbr}</span>
                <div
                  className={[styles.tlBarWrap, day.isClosed ? styles.tlBarClosed : ''].join(' ')}
                >
                  <div
                    className={styles.tlBarFill}
                    style={{ left: `${openPct}%`, width: `${widthPct}%` }}
                  />
                </div>
                <span className={styles.tlDayHours}>
                  {day.isClosed ? '—' : `${day.openTime}–${day.closeTime}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
