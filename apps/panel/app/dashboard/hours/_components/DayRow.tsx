import { type DayEntry } from '../../../../lib/hooks/use-working-hours';
import { DAY_META, SLOT_OPTIONS, computeSlots, formatDuration } from './utils';
import styles from '../hours.module.css';

interface Props {
  day: DayEntry;
  isToday: boolean;
  error: string | undefined;
  onUpdate: (dayOfWeek: number, patch: Partial<DayEntry>) => void;
}

export function DayRow({ day, isToday, error, onUpdate }: Props) {
  const meta = DAY_META[day.dayOfWeek] ?? { abbr: '?', full: '?' };
  const slots = day.isClosed ? 0 : computeSlots(day.openTime, day.closeTime, day.slotMinutes);

  return (
    <div
      className={[
        styles.dayRow,
        day.isClosed ? styles.dayRowClosed : '',
        isToday ? styles.dayRowToday : '',
      ].join(' ')}
    >
      <div className={styles.dayName}>
        <span className={styles.dayAbbr}>{meta.abbr}</span>
        <span className={styles.dayFull}>{meta.full}</span>
        {isToday && <span className={styles.todayTag}>Dziś</span>}
      </div>

      <button
        className={[styles.toggle, !day.isClosed ? styles.toggleOn : ''].join(' ')}
        role="switch"
        aria-checked={!day.isClosed}
        aria-label={`${meta.full} — ${day.isClosed ? 'nieczynne' : 'otwarte'}`}
        onClick={() => onUpdate(day.dayOfWeek, { isClosed: !day.isClosed })}
      />

      {day.isClosed ? (
        <span className={styles.closedLabel}>Nieczynne</span>
      ) : (
        <>
          <label className={[styles.timeInput, error ? styles.timeInputError : ''].join(' ')}>
            <span className={styles.timeLabel}>Od</span>
            <input
              type="time"
              value={day.openTime}
              onChange={(e) => onUpdate(day.dayOfWeek, { openTime: e.target.value })}
            />
          </label>
          <label className={[styles.timeInput, error ? styles.timeInputError : ''].join(' ')}>
            <span className={styles.timeLabel}>Do</span>
            <input
              type="time"
              value={day.closeTime}
              onChange={(e) => onUpdate(day.dayOfWeek, { closeTime: e.target.value })}
            />
          </label>
          <select
            className={styles.slotSelect}
            value={day.slotMinutes}
            onChange={(e) => onUpdate(day.dayOfWeek, { slotMinutes: Number(e.target.value) })}
            aria-label="Długość slotu"
          >
            {SLOT_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
          <div className={styles.slotInfo}>
            <span className={[styles.slotCount, isToday ? styles.slotCountAccent : ''].join(' ')}>
              {slots} slotów
            </span>
            <span className={styles.slotHint}>{formatDuration(day.openTime, day.closeTime)}</span>
          </div>
        </>
      )}

      {error && <span className={styles.dayError}>{error}</span>}
    </div>
  );
}
