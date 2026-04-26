import { Input, Toggle, Select } from '@opony/design-system-web';
import { type DayEntry } from '../../../../lib/hooks/use-working-hours';
import { DAY_META, SLOT_OPTIONS, computeSlots, formatDuration } from './utils';
import styles from '../hours.module.css';

interface Props {
  day: DayEntry;
  isToday: boolean;
  error: string | undefined;
  onUpdate: (dayOfWeek: number, patch: Partial<DayEntry>) => void;
}

const slotOptions = SLOT_OPTIONS.map((m) => ({ value: String(m), label: `${m} min` }));

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

      <Toggle
        size="sm"
        checked={!day.isClosed}
        onChange={() => onUpdate(day.dayOfWeek, { isClosed: !day.isClosed })}
        aria-label={`${meta.full} — ${day.isClosed ? 'nieczynne' : 'otwarte'}`}
      />

      {day.isClosed ? (
        <span className={styles.closedLabel}>Nieczynne</span>
      ) : (
        <>
          <Input
            type="time"
            value={day.openTime}
            prefix={<span>Od</span>}
            error={error ? ' ' : undefined}
            onChange={(e) => onUpdate(day.dayOfWeek, { openTime: e.target.value })}
            className={styles.timeInputDs}
          />
          <Input
            type="time"
            value={day.closeTime}
            prefix={<span>Do</span>}
            error={error ? ' ' : undefined}
            onChange={(e) => onUpdate(day.dayOfWeek, { closeTime: e.target.value })}
            className={styles.timeInputDs}
          />
          <Select
            options={slotOptions}
            value={String(day.slotMinutes)}
            onChange={(e) => onUpdate(day.dayOfWeek, { slotMinutes: Number(e.target.value) })}
            aria-label="Długość slotu"
            className={styles.slotSelectDs}
          />
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
