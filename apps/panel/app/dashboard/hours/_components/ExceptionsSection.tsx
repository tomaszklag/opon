import { Button, Heading, Text } from '@opony/design-system-web';
import { IconBriefcase, IconCalendarOff, IconPlus } from '../../../../components/icons';
import styles from '../hours.module.css';

type HolidayType = 'holiday' | 'vacation';

interface HolidayEntry {
  date: string;
  name: string;
  type: HolidayType;
  isAuto: boolean;
  meta?: string;
}

const TODAY = new Date().toISOString().slice(0, 10);

const HOLIDAYS: HolidayEntry[] = [
  {
    date: '2026-05-01',
    name: 'Święto Pracy',
    type: 'holiday',
    isAuto: true,
    meta: '01 maj 2026 · cały dzień nieczynne',
  },
  {
    date: '2026-05-03',
    name: 'Konstytucja 3 Maja',
    type: 'holiday',
    isAuto: true,
    meta: '03 maj 2026 · cały dzień nieczynne',
  },
  {
    date: '2026-05-24',
    name: 'Zielone Świątki',
    type: 'holiday',
    isAuto: true,
    meta: '24 maj 2026 · cały dzień nieczynne',
  },
  {
    date: '2026-06-04',
    name: 'Boże Ciało',
    type: 'holiday',
    isAuto: true,
    meta: '04 cze 2026 · cały dzień nieczynne',
  },
  {
    date: '2026-08-15',
    name: 'Wniebowzięcie NMP',
    type: 'holiday',
    isAuto: true,
    meta: '15 sie 2026 · cały dzień nieczynne',
  },
  {
    date: '2026-11-01',
    name: 'Wszystkich Świętych',
    type: 'holiday',
    isAuto: true,
    meta: '01 lis 2026 · cały dzień nieczynne',
  },
  {
    date: '2026-11-11',
    name: 'Święto Niepodległości',
    type: 'holiday',
    isAuto: true,
    meta: '11 lis 2026 · cały dzień nieczynne',
  },
  {
    date: '2026-12-25',
    name: 'Boże Narodzenie',
    type: 'holiday',
    isAuto: true,
    meta: '25–26 gru 2026 · cały dzień nieczynne',
  },
];

const VISIBLE_HOLIDAYS = HOLIDAYS.filter((h) => h.date >= TODAY).slice(0, 4);

function ExceptionIcon({ type }: { type: HolidayType }) {
  if (type === 'vacation') {
    return (
      <div className={[styles.exceptionIco, styles.exceptionIcoVacation].join(' ')}>
        <IconBriefcase width="14" height="14" />
      </div>
    );
  }
  return (
    <div className={[styles.exceptionIco, styles.exceptionIcoHoliday].join(' ')}>
      <IconCalendarOff width="14" height="14" />
    </div>
  );
}

function ExceptionTag({ type }: { type: HolidayType }) {
  if (type === 'vacation') {
    return (
      <Text
        variant="nano"
        as="span"
        color="accent"
        className={[styles.exceptionTag, styles.exceptionTagVacation].join(' ')}
      >
        Urlop
      </Text>
    );
  }
  return (
    <Text
      variant="nano"
      as="span"
      className={[styles.exceptionTag, styles.exceptionTagHoliday].join(' ')}
    >
      Święto PL · auto
    </Text>
  );
}

export function ExceptionsSection() {
  return (
    <section className={styles.secCard}>
      <div className={styles.secHead}>
        <Heading variant="section" as="h2">
          Wyjątki i urlopy
        </Heading>
        <Text variant="nano" as="span" color="muted">
          Dni zamknięte poza cyklem · święta PL dodane automatycznie
        </Text>
      </div>

      <div className={styles.exceptionList}>
        {VISIBLE_HOLIDAYS.map((h) => (
          <div
            key={h.date}
            className={[styles.exceptionItem, h.isAuto ? styles.exceptionItemAuto : ''].join(' ')}
          >
            <ExceptionIcon type={h.type} />
            <div className={styles.exceptionInfo}>
              <div className={styles.exceptionName}>
                <Text variant="body-sm" as="span" weight="bold">
                  {h.name}
                </Text>
                <ExceptionTag type={h.type} />
              </div>
              {h.meta && (
                <Text variant="nano" as="p" color="muted" mono>
                  {h.meta}
                </Text>
              )}
            </div>
          </div>
        ))}

        <Button variant="ghost" size="sm" disabled className={styles.addExceptionBtn} type="button">
          <IconPlus width="14" height="14" />
          Dodaj urlop lub zmianę godzin
        </Button>
      </div>
    </section>
  );
}
