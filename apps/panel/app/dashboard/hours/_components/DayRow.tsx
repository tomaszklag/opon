import { Button, IconButton, Select, Text, TimeInput, Toggle } from '@opony/design-system-web';
import { type CapacityBlock, type DayEntry } from '../../../../lib/hooks/use-working-hours';
import { IconCopy, IconMinus, IconPlus, IconSplit } from '../../../../components/icons';
import { DAY_META, SLOT_OPTIONS, computeSlotsForDay, formatDuration } from './utils';
import { CapacityBlockEditor } from './CapacityBlockEditor';
import styles from '../hours.module.css';

interface Props {
  day: DayEntry;
  defaultSlotMinutes: number;
  isToday: boolean;
  error: string | undefined;
  onUpdate: (dayOfWeek: number, patch: Partial<DayEntry>) => void;
  onCopyToAll: (fromDow: number) => void;
  onToggleBlocks: (dayOfWeek: number) => void;
  onUpdateBlock: (dayOfWeek: number, index: number, patch: Partial<CapacityBlock>) => void;
  onAddBlock: (dayOfWeek: number) => void;
  onRemoveBlock: (dayOfWeek: number, index: number) => void;
}

const slotOptions = SLOT_OPTIONS.map((m) => ({ value: String(m), label: `${m} min` }));

export function DayRow({
  day,
  defaultSlotMinutes,
  isToday,
  error,
  onUpdate,
  onCopyToAll,
  onToggleBlocks,
  onUpdateBlock,
  onAddBlock,
  onRemoveBlock,
}: Props) {
  const meta = DAY_META[day.dayOfWeek] ?? { abbr: '?', full: '?' };
  const totalSlots = day.isClosed ? 0 : computeSlotsForDay(day);
  const isOverride = !day.isClosed && day.slotMinutes !== defaultSlotMinutes;
  const hasBlocks = !day.isClosed && day.blocks !== null && day.blocks.length > 0;

  return (
    <div
      className={[
        styles.dayRow,
        day.isClosed ? styles.dayRowClosed : '',
        isToday ? styles.dayRowToday : '',
      ].join(' ')}
    >
      {/* Day name */}
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

      {/* Toggle */}
      <Toggle
        size="sm"
        checked={!day.isClosed}
        onChange={() => onUpdate(day.dayOfWeek, { isClosed: !day.isClosed })}
        aria-label={`${meta.full} — ${day.isClosed ? 'nieczynne' : 'otwarte'}`}
      />

      {/* Time inputs or closed label */}
      {day.isClosed ? (
        <Text variant="nano" as="span" color="muted" className={styles.closedLabel}>
          — Nieczynne —
        </Text>
      ) : (
        <>
          <TimeInput
            label="Od"
            value={day.openTime}
            onChange={(v) => onUpdate(day.dayOfWeek, { openTime: v })}
            error={!!error}
          />
          <TimeInput
            label="Do"
            value={day.closeTime}
            onChange={(v) => onUpdate(day.dayOfWeek, { closeTime: v })}
            error={!!error}
          />

          {/* Slot select */}
          <div className={styles.slotSelectWrap}>
            <Select
              options={slotOptions}
              value={String(day.slotMinutes)}
              onChange={(e) => onUpdate(day.dayOfWeek, { slotMinutes: Number(e.target.value) })}
              aria-label="Długość slotu"
            />
            {isOverride && (
              <Text variant="nano" as="span" color="accent" className={styles.overrideTag}>
                Nadpisane
              </Text>
            )}
          </div>

          {/* Workstations stepper + slot info */}
          <div className={styles.dayRowMeta}>
            <div className={styles.workstationStepper}>
              <IconButton
                size="xs"
                aria-label="Zmniejsz liczbę stanowisk"
                onClick={() =>
                  onUpdate(day.dayOfWeek, { workstations: Math.max(1, day.workstations - 1) })
                }
                disabled={day.workstations <= 1 || hasBlocks}
              >
                <IconMinus width="10" height="10" />
              </IconButton>
              <Text
                variant="nano"
                as="span"
                color={hasBlocks ? 'muted' : undefined}
                className={styles.workstationValue}
              >
                {hasBlocks ? '~' : day.workstations}
              </Text>
              <Text variant="nano" as="span" color="muted">
                st.
              </Text>
              <IconButton
                size="xs"
                aria-label="Zwiększ liczbę stanowisk"
                onClick={() =>
                  onUpdate(day.dayOfWeek, { workstations: Math.min(10, day.workstations + 1) })
                }
                disabled={day.workstations >= 10 || hasBlocks}
              >
                <IconPlus width="10" height="10" />
              </IconButton>
            </div>
            <div className={styles.slotInfo}>
              <Text variant="nano" as="span" color={isToday ? 'accent' : undefined}>
                {totalSlots} rez.
              </Text>
              <Text variant="caption" as="p" color="muted">
                {formatDuration(day.openTime, day.closeTime)}
              </Text>
            </div>
          </div>
        </>
      )}

      {/* Copy button */}
      <IconButton
        size="xs"
        aria-label={`Kopiuj ${meta.abbr} do wszystkich dni`}
        className={styles.copyBtn}
        onClick={() => onCopyToAll(day.dayOfWeek)}
      >
        <IconCopy width="12" height="12" />
      </IconButton>

      {/* Validation error */}
      {error && (
        <Text variant="nano" as="span" className={styles.dayError}>
          {error}
        </Text>
      )}

      {/* Split day expand area */}
      {!day.isClosed && (
        <div className={styles.dayRowExpand}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleBlocks(day.dayOfWeek)}
            className={hasBlocks ? styles.splitBtnActive : styles.splitBtn}
          >
            <IconSplit width="12" height="12" />
            {hasBlocks ? 'Usuń podział dnia' : 'Podziel dzień'}
          </Button>

          {hasBlocks && day.blocks && (
            <CapacityBlockEditor
              blocks={day.blocks}
              slotMinutes={day.slotMinutes}
              onUpdateBlock={(index, patch) => onUpdateBlock(day.dayOfWeek, index, patch)}
              onAddBlock={() => onAddBlock(day.dayOfWeek)}
              onRemoveBlock={(index) => onRemoveBlock(day.dayOfWeek, index)}
            />
          )}
        </div>
      )}
    </div>
  );
}
