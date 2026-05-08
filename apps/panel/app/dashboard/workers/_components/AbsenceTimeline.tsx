'use client';

import React, { useMemo, useState } from 'react';
import { Heading, Text } from '@opony/design-system-web';
import {
  IconChevronLeft,
  IconChevronRight,
  IconInfo,
  IconPlus,
} from '../../../../components/icons';
import type { Worker } from '../../../../lib/hooks/use-workers';
import styles from '../workers.module.css';

interface Props {
  workers: Worker[];
  onRequestAddLeave: (workerId: string) => void;
}

const MONTH_NAMES = [
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

const LEAVE_TYPE_COLORS: Record<string, string> = {
  VACATION: 'var(--accent)',
  SICK: 'var(--warning)',
  UNPAID: '#A855F7',
  OTHER: 'var(--text-muted)',
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  VACATION: 'Urlop',
  SICK: 'Chorobowe',
  UNPAID: 'Bezpłatny',
  OTHER: 'Inna',
};

// ── helpers ───────────────────────────────────────────────────────────────────

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toDate(iso: string): Date {
  return new Date(iso.slice(0, 10) + 'T00:00:00');
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface DayInfo {
  iso: string;
  dayNum: number;
  isToday: boolean;
  isWeekend: boolean;
  isMonthStart: boolean;
}

interface MonthMeta {
  year: number;
  month: number;
  count: number;
}

function buildRange(
  year: number,
  month: number,
): { days: DayInfo[]; m0: MonthMeta; m1: MonthMeta } {
  const todayISO = toISO(new Date());
  const days: DayInfo[] = [];

  function pushMonth(y: number, m: number) {
    const count = getDaysInMonth(y, m);
    for (let d = 1; d <= count; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = new Date(y, m, d).getDay();
      days.push({
        iso,
        dayNum: d,
        isToday: iso === todayISO,
        isWeekend: dow === 0 || dow === 6,
        isMonthStart: d === 1,
      });
    }
  }

  pushMonth(year, month);
  const next = new Date(year, month + 1, 1);
  pushMonth(next.getFullYear(), next.getMonth());

  return {
    days,
    m0: { year, month, count: getDaysInMonth(year, month) },
    m1: {
      year: next.getFullYear(),
      month: next.getMonth(),
      count: getDaysInMonth(next.getFullYear(), next.getMonth()),
    },
  };
}

function getLeaveColorMap(worker: Worker): Map<string, { color: string; title: string }> {
  const map = new Map<string, { color: string; title: string }>();
  for (const leave of worker.leaves) {
    const color = LEAVE_TYPE_COLORS[leave.type] ?? 'var(--text-muted)';
    const label = LEAVE_TYPE_LABELS[leave.type] ?? leave.type;
    const title = `${label}: ${leave.startDate.slice(0, 10)} – ${leave.endDate.slice(0, 10)}`;
    const cursor = new Date(toDate(leave.startDate));
    const end = toDate(leave.endDate);
    while (cursor <= end) {
      map.set(toISO(cursor), { color, title });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return map;
}

function getShortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1];
  return parts.length >= 2 && last && last !== first ? `${first} ${last[0]}.` : first;
}

const NAME_W = 88;
const DAY_W = 14;
const BTN_W = 28;

// ── component ─────────────────────────────────────────────────────────────────

export function AbsenceTimeline({ workers, onRequestAddLeave }: Props) {
  const now = new Date();
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth());

  const { days, m0, m1 } = useMemo(
    () => buildRange(displayYear, displayMonth),
    [displayYear, displayMonth],
  );

  const workerMaps = useMemo(
    () => workers.map((w) => ({ worker: w, colorMap: getLeaveColorMap(w) })),
    [workers],
  );

  function prevMonth() {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else setDisplayMonth((m) => m - 1);
  }
  function nextMonth() {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else setDisplayMonth((m) => m + 1);
  }

  const isAtMin = displayYear === now.getFullYear() && displayMonth === now.getMonth();

  // 1-indexed column positions
  const m0Start = 2;
  const m1Start = 2 + m0.count;
  const gridCols = `${NAME_W}px repeat(${days.length}, ${DAY_W}px) ${BTN_W}px`;

  return (
    <div className={styles.timelineSection}>
      {/* Header */}
      <div className={styles.previewHead}>
        <Heading variant="subsection" as="h3">
          Nieobecności
        </Heading>
        <div className={styles.tlNav}>
          <button
            type="button"
            className={styles.tlNavBtn}
            onClick={prevMonth}
            disabled={isAtMin}
            title="Poprzednie miesiące"
          >
            <IconChevronLeft width="12" height="12" />
          </button>
          <Text variant="nano" as="span" mono color="muted">
            {MONTH_NAMES[m0.month]}
            {m0.year !== m1.year ? ` ${m0.year}` : ''}
            {' – '}
            {MONTH_NAMES[m1.month]} {m1.year}
          </Text>
          <button
            type="button"
            className={styles.tlNavBtn}
            onClick={nextMonth}
            title="Następne miesiące"
          >
            <IconChevronRight width="12" height="12" />
          </button>
        </div>
      </div>

      {/* Day grid */}
      <div className={styles.dayGridWrap}>
        <div className={styles.dayGrid} style={{ gridTemplateColumns: gridCols }}>
          {/* ── Month header row ── */}
          <div className={styles.dgNameHdr} />
          <div
            className={styles.dgMonthHdr}
            style={{ gridColumn: `${m0Start} / span ${m0.count}` }}
          >
            <Text variant="nano" weight="bold" color="secondary" as="span">
              {MONTH_NAMES[m0.month]} {m0.year}
            </Text>
          </div>
          <div
            className={`${styles.dgMonthHdr} ${styles.dgMonthHdr2}`}
            style={{ gridColumn: `${m1Start} / span ${m1.count}` }}
          >
            <Text variant="nano" weight="bold" color="secondary" as="span">
              {MONTH_NAMES[m1.month]} {m1.year}
            </Text>
          </div>
          <div />

          {/* ── Day number row ── */}
          <div className={styles.dgNameHdr} />
          {days.map((d) => {
            const show = d.dayNum === 1 || d.dayNum % 7 === 0 || d.isToday;
            return (
              <div
                key={d.iso}
                className={[styles.dgDayNum, d.isMonthStart ? styles.dgCellMonthStart : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {show && (
                  <Text
                    variant="nano"
                    as="span"
                    color={d.isToday ? 'accent' : 'muted'}
                    weight={d.isToday ? 'bold' : undefined}
                  >
                    {d.dayNum}
                  </Text>
                )}
              </div>
            );
          })}
          <div />

          {/* ── Worker rows ── */}
          {workerMaps.map(({ worker, colorMap }) => (
            <React.Fragment key={worker.id}>
              <div className={`${styles.dgName} ${styles.dgNameSticky}`}>
                <Text variant="nano" weight="bold" color="secondary" as="span">
                  {getShortName(worker.name)}
                </Text>
              </div>
              {days.map((d) => {
                const leave = colorMap.get(d.iso);
                return (
                  <div
                    key={d.iso}
                    className={[
                      styles.dgCell,
                      d.isToday ? styles.dgCellToday : '',
                      d.isWeekend ? styles.dgCellWeekend : '',
                      d.isMonthStart ? styles.dgCellMonthStart : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    title={leave?.title}
                  >
                    {leave && <div className={styles.dgFill} style={{ background: leave.color }} />}
                  </div>
                );
              })}
              <button
                type="button"
                className={styles.tlAddBtn}
                onClick={() => onRequestAddLeave(worker.id)}
                title={`Dodaj nieobecność — ${worker.name}`}
              >
                <IconPlus width="10" height="10" />
              </button>
            </React.Fragment>
          ))}

          {/* ── Coverage row ── */}
          <div className={`${styles.dgName} ${styles.dgNameSticky}`}>
            <Text variant="nano" weight="bold" color="muted" as="span">
              Obsada
            </Text>
          </div>
          {days.map((d) => {
            const absentCount = workerMaps.filter(({ colorMap }) => colorMap.has(d.iso)).length;
            const total = workers.length;
            const ratio = total > 0 ? (total - absentCount) / total : 1;
            const covColor =
              absentCount === 0
                ? undefined
                : ratio > 0.5
                  ? 'var(--warning-muted)'
                  : 'var(--danger-muted)';
            return (
              <div
                key={d.iso}
                className={[
                  styles.dgCell,
                  styles.dgCovCell,
                  d.isToday ? styles.dgCellToday : '',
                  d.isMonthStart ? styles.dgCellMonthStart : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {covColor && <div className={styles.dgFill} style={{ background: covColor }} />}
              </div>
            );
          })}
          <div />
        </div>
      </div>

      {/* Legend */}
      <div className={styles.timelineLegend}>
        {(['VACATION', 'SICK', 'UNPAID', 'OTHER'] as const).map((type) => (
          <div key={type} className={styles.tlLegendItem}>
            <div className={styles.tlLegendDot} style={{ background: LEAVE_TYPE_COLORS[type] }} />
            <Text variant="nano" mono color="muted" as="span">
              {LEAVE_TYPE_LABELS[type]}
            </Text>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className={styles.infoNote}>
        <IconInfo width="12" height="12" className={styles.infoNoteIcon} />
        <Text variant="nano" as="span" color="muted">
          W oknie nieobecności slot engine nie przydziela tego pracownika do stanowiska. Jeśli
          stanowisko nie ma innego pracownika — sloty blokowane automatycznie.
        </Text>
      </div>
    </div>
  );
}
