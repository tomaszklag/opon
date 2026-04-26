import { type DayEntry } from '../../../../lib/hooks/use-working-hours';
import { DayRow } from './DayRow';
import styles from '../hours.module.css';

interface Props {
  days: DayEntry[];
  errors: Record<number, string>;
  todayDow: number;
  onUpdate: (dayOfWeek: number, patch: Partial<DayEntry>) => void;
}

export function DayList({ days, errors, todayDow, onUpdate }: Props) {
  return (
    <section className={styles.secCard}>
      <div className={styles.secHead}>
        <h2 className={styles.secTitle}>Tydzień</h2>
        <span className={styles.secSub}>Toggle — włącz lub wyłącz dzień</span>
      </div>

      {days.map((day) => (
        <DayRow
          key={day.dayOfWeek}
          day={day}
          isToday={day.dayOfWeek === todayDow}
          error={errors[day.dayOfWeek]}
          onUpdate={onUpdate}
        />
      ))}
    </section>
  );
}
