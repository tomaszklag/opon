import { Heading, Text } from '@opony/design-system-web';
import { type DayEntry } from '../../../../lib/hooks/use-working-hours';
import { DayRow } from './DayRow';
import styles from '../hours.module.css';

interface Props {
  days: DayEntry[];
  defaultSlotMinutes: number;
  errors: Record<number, string>;
  todayDow: number;
  onUpdate: (dayOfWeek: number, patch: Partial<DayEntry>) => void;
  onCopyToAll: (fromDow: number) => void;
}

export function DayList({
  days,
  defaultSlotMinutes,
  errors,
  todayDow,
  onUpdate,
  onCopyToAll,
}: Props) {
  return (
    <section className={styles.secCard}>
      <div className={styles.secHead}>
        <Heading variant="section" as="h2">
          Tydzień
        </Heading>
        <Text variant="nano" as="span" color="muted">
          Toggle — włącz lub wyłącz dzień · Pn–Pt 8–18, Sb 9–14, Nd nieczynne
        </Text>
      </div>

      {days.map((day) => (
        <DayRow
          key={day.dayOfWeek}
          day={day}
          defaultSlotMinutes={defaultSlotMinutes}
          isToday={day.dayOfWeek === todayDow}
          error={errors[day.dayOfWeek]}
          onUpdate={onUpdate}
          onCopyToAll={onCopyToAll}
        />
      ))}
    </section>
  );
}
