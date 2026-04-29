import { IconButton, Select, Text, Toggle } from '@opony/design-system-web';
import { type DayEntry } from '../../../../lib/hooks/use-working-hours';
import { IconCopy } from '../../../../components/icons';
import { DAY_META, SLOT_OPTIONS, computeSlots, formatDuration } from './utils';
import styles from '../hours.module.css';

interface Props {
  day: DayEntry;
  defaultSlotMinutes: number;
  isToday: boolean;
  error: string | undefined;
  onUpdate: (dayOfWeek: number, patch: Partial<DayEntry>) => void;
  onCopyToAll: (fromDow: number) => void;
}

const slotOptions = SLOT_OPTIONS.map((m) => ({ value: String(m), label: `${m} min` }));

export function DayRow({ day, defaultSlotMinutes, isToday, error, onUpdate, onCopyToAll }: Props) {
  const meta = DAY_META[day.dayOfWeek] ?? { abbr: '?', full: '?' };
  const slots = day.isClosed ? 0 : computeSlots(day.openTime, day.closeTime, day.slotMinutes);
  const isOverride = !day.isClosed && day.slotMinutes !== defaultSlotMinutes;

  return (
    <div
      className={[
        styles.dayRow,
        day.isClosed ? styles.dayRowClosed : '',
        isToday ? styles.dayRowToday : '',
      ].join(' ')}
    >
      <div className={styles.dayName}>
        <Text variant="label" as="span">
          {meta.abbr}
        </Text>
        <Text variant="nano" as="span" color="muted" className={styles.dayFull}>
          {meta.full}
        </Text>
        {isToday && (
          <Text variant="nano" as="span" className={styles.todayTag}>
            Dziś
          </Text>
        )}
      </div>

      <Toggle
        size="sm"
        checked={!day.isClosed}
        onChange={() => onUpdate(day.dayOfWeek, { isClosed: !day.isClosed })}
        aria-label={`${meta.full} — ${day.isClosed ? 'nieczynne' : 'otwarte'}`}
      />

      {day.isClosed ? (
        <Text variant="nano" as="span" color="muted" className={styles.closedLabel}>
          — Nieczynne —
        </Text>
      ) : (
        <>
          <label className={[styles.timeInput, error ? styles.timeInputError : ''].join(' ')}>
            <Text variant="nano" as="span" color="muted">
              Od
            </Text>
            <input
              type="time"
              value={day.openTime}
              onChange={(e) => onUpdate(day.dayOfWeek, { openTime: e.target.value })}
            />
          </label>
          <label className={[styles.timeInput, error ? styles.timeInputError : ''].join(' ')}>
            <Text variant="nano" as="span" color="muted">
              Do
            </Text>
            <input
              type="time"
              value={day.closeTime}
              onChange={(e) => onUpdate(day.dayOfWeek, { closeTime: e.target.value })}
            />
          </label>
          <div className={styles.slotSelectWrap}>
            <Select
              options={slotOptions}
              value={String(day.slotMinutes)}
              onChange={(e) => onUpdate(day.dayOfWeek, { slotMinutes: Number(e.target.value) })}
              aria-label="Długość slotu"
            />
            {isOverride && (
              <Text variant="nano" as="span" className={styles.overrideTag}>
                Nadpisane
              </Text>
            )}
          </div>
          <div className={styles.slotInfo}>
            <Text variant="nano" as="span" color={isToday ? 'accent' : undefined}>
              {slots} slotów
            </Text>
            <Text variant="caption" as="p" color="muted">
              {formatDuration(day.openTime, day.closeTime)}
            </Text>
          </div>
        </>
      )}

      <IconButton
        size="xs"
        aria-label={`Kopiuj ${meta.abbr} do wszystkich dni`}
        className={styles.copyBtn}
        onClick={() => onCopyToAll(day.dayOfWeek)}
      >
        <IconCopy width="12" height="12" />
      </IconButton>

      {error && (
        <Text variant="nano" as="span" className={styles.dayError}>
          {error}
        </Text>
      )}
    </div>
  );
}
