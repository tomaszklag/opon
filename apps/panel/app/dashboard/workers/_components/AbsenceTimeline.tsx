import { Heading, Text } from '@opony/design-system-web';
import { IconInfo } from '../../../../components/icons';
import type { Worker } from '../../../../lib/hooks/use-workers';
import styles from '../workers.module.css';

interface Props {
  workers: Worker[];
}

const MONTH_NAMES_SHORT = [
  'STY',
  'LUT',
  'MAR',
  'KWI',
  'MAJ',
  'CZE',
  'LIP',
  'SIE',
  'WRZ',
  'PAŹ',
  'LIS',
  'GRU',
];
const MONTH_NAMES_LONG = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

function getMonthRange(): { year: number; month: number }[] {
  const today = new Date();
  const result: { year: number; month: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return result;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface BarSegment {
  left: number;
  width: number;
  type: 'vacation' | 'soon';
}

function getBarForMonth(
  startDate: string,
  endDate: string,
  year: number,
  month: number,
  isSoon: boolean,
): BarSegment | null {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const leaveStart = new Date(startDate + 'T00:00:00');
  const leaveEnd = new Date(endDate + 'T00:00:00');

  if (leaveEnd < monthStart || leaveStart > monthEnd) return null;

  const overlapStart = leaveStart < monthStart ? monthStart : leaveStart;
  const overlapEnd = leaveEnd > monthEnd ? monthEnd : leaveEnd;

  const totalDays = getDaysInMonth(year, month);
  const left = ((overlapStart.getDate() - 1) / totalDays) * 100;
  const width = ((overlapEnd.getDate() - overlapStart.getDate() + 1) / totalDays) * 100;

  return { left, width, type: isSoon ? 'soon' : 'vacation' };
}

function getFirstNameInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && last && last !== first) {
    return `${first} ${last[0]}.`;
  }
  return first;
}

function isOnLeaveToday(startDate: string, endDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  return today >= start && today <= end;
}

function isWorkerAbsentToday(worker: Worker): boolean {
  return worker.leaves.some((l) => isOnLeaveToday(l.startDate, l.endDate));
}

function formatDatePL(date: Date): string {
  const day = date.getDate();
  const month = MONTH_NAMES_LONG[date.getMonth()];
  const year = date.getFullYear();
  const dow = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'][date.getDay()] ?? '';
  return `${day} ${month} ${year} · ${dow}`;
}

function isSoonLeave(startDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const start = new Date(startDate + 'T00:00:00');
  return start > today && start <= in30;
}

export function AbsenceTimeline({ workers }: Props) {
  const months = getMonthRange();
  const today = new Date();

  // Check if any worker has leaves to show
  const hasLeaves = workers.some((w) => w.leaves.length > 0);

  return (
    <>
      {/* Gantt panel */}
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <Heading variant="subsection" as="h3">
            Nieobecności
          </Heading>
          <Text variant="nano" as="span" mono color="muted">
            {MONTH_NAMES_SHORT[months[0]?.month ?? 0]} –{' '}
            {MONTH_NAMES_SHORT[months[months.length - 1]?.month ?? 3]} {months[0]?.year}
          </Text>
        </div>

        {!hasLeaves ? (
          <Text variant="body-sm" as="p" color="muted">
            Brak zaplanowanych urlopów.
          </Text>
        ) : (
          <div className={styles.timelineWrap}>
            {/* Month headers */}
            <div className={styles.timelineHead}>
              <div />
              {months.map(({ year, month }) => (
                <div key={`${year}-${month}`} className={styles.tlMonth}>
                  <Text variant="nano" as="span" mono color="muted">
                    {MONTH_NAMES_SHORT[month]}
                  </Text>
                </div>
              ))}
            </div>

            {/* Worker rows */}
            {workers.map((worker) => (
              <div key={worker.id} className={styles.timelineRow}>
                <div className={styles.tlName}>{getFirstNameInitial(worker.name)}</div>
                {months.map(({ year, month }) => {
                  const segments: BarSegment[] = [];
                  for (const leave of worker.leaves) {
                    const soon = isSoonLeave(leave.startDate);
                    const seg = getBarForMonth(leave.startDate, leave.endDate, year, month, soon);
                    if (seg) segments.push(seg);
                  }

                  return (
                    <div key={`${year}-${month}`} className={styles.tlCell}>
                      {segments.length === 0 ? (
                        <div className={styles.tlEmpty}>·</div>
                      ) : (
                        segments.map((seg, i) => (
                          <div
                            key={i}
                            className={`${styles.tlBar} ${
                              seg.type === 'soon' ? styles.tlBarSoon : styles.tlBarVacation
                            }`}
                            style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
                          />
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className={styles.timelineLegend}>
          <div className={styles.tlLegendItem}>
            <div className={`${styles.tlLegendDot} ${styles.tlLegendDotVacation}`} />
            <Text variant="nano" as="span" mono color="muted">
              Urlop wypoczynkowy
            </Text>
          </div>
          <div className={styles.tlLegendItem}>
            <div className={`${styles.tlLegendDot} ${styles.tlLegendDotSoon}`} />
            <Text variant="nano" as="span" mono color="muted">
              Urlop (wkrótce)
            </Text>
          </div>
        </div>

        <div className={styles.infoNote}>
          <IconInfo width="12" height="12" className={styles.infoNoteIcon} />
          <Text variant="nano" as="span" color="muted">
            W oknie nieobecności slot engine nie przydziela tego pracownika do stanowiska. Jeśli
            stanowisko nie ma innego pracownika — sloty blokowane automatycznie.
          </Text>
        </div>
      </div>

      {/* Today status panel */}
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <Heading variant="subsection" as="h3">
            Dziś
          </Heading>
          <Text variant="nano" as="span" mono color="muted">
            {formatDatePL(today)}
          </Text>
        </div>

        {workers.length === 0 ? (
          <Text variant="body-sm" as="p" color="muted">
            Brak pracowników.
          </Text>
        ) : (
          <div className={styles.todayList}>
            {workers.map((worker) => {
              const absent = isWorkerAbsentToday(worker);
              const activeLeave = worker.leaves.find((l) => isOnLeaveToday(l.startDate, l.endDate));

              return (
                <div
                  key={worker.id}
                  className={`${styles.todayItem}${absent ? ` ${styles.todayItemAbsent}` : ''}`}
                >
                  <div className={absent ? styles.todayDotAbsent : styles.todayDotActive} />
                  <Text
                    variant="body-sm"
                    as="span"
                    weight="bold"
                    style={
                      absent
                        ? { textDecoration: 'line-through', color: 'var(--text-muted)' }
                        : undefined
                    }
                  >
                    {worker.name}
                  </Text>
                  {worker.stations.length > 0 && (
                    <Text variant="nano" as="span" color="muted">
                      {worker.stations.map((s) => s.stationName).join(', ')}
                    </Text>
                  )}
                  {absent && activeLeave && (
                    <Text variant="nano" as="span" color="accent" mono>
                      Urlop
                    </Text>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
