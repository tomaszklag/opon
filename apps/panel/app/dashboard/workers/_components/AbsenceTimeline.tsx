'use client';

import { useState } from 'react';
import { Heading, Text } from '@opony/design-system-web';
import {
  IconInfo,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from '../../../../components/icons';
import type { Worker } from '../../../../lib/hooks/use-workers';
import { LEAVE_TYPE_LABELS } from './WorkerCard';
import styles from '../workers.module.css';

interface Props {
  workers: Worker[];
  saving: boolean;
  onRequestAddLeave: (workerId: string) => void;
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

const LEAVE_TYPE_COLORS: Record<string, string> = {
  VACATION: 'var(--accent)',
  SICK: 'var(--warning)',
  UNPAID: '#A855F7',
  OTHER: 'var(--text-muted)',
};

function toDate(iso: string): Date {
  return new Date(iso.slice(0, 10) + 'T00:00:00');
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthRange(offset: number): { year: number; month: number }[] {
  const today = new Date();
  const result: { year: number; month: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + offset + i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return result;
}

interface BarSegment {
  left: number;
  width: number;
  color: string;
  isSoon: boolean;
  title: string;
}

function isSoonLeave(startDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const start = toDate(startDate);
  return start > today && start <= in30;
}

function getBarForMonth(
  startDate: string,
  endDate: string,
  leaveType: string,
  year: number,
  month: number,
): BarSegment | null {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const leaveStart = toDate(startDate);
  const leaveEnd = toDate(endDate);

  if (leaveEnd < monthStart || leaveStart > monthEnd) return null;

  const overlapStart = leaveStart < monthStart ? monthStart : leaveStart;
  const overlapEnd = leaveEnd > monthEnd ? monthEnd : leaveEnd;

  const totalDays = getDaysInMonth(year, month);
  const left = ((overlapStart.getDate() - 1) / totalDays) * 100;
  const width = ((overlapEnd.getDate() - overlapStart.getDate() + 1) / totalDays) * 100;
  const color = LEAVE_TYPE_COLORS[leaveType] ?? 'var(--text-muted)';
  const soon = isSoonLeave(startDate);

  return {
    left,
    width,
    color,
    isSoon: soon,
    title: `${LEAVE_TYPE_LABELS[leaveType as keyof typeof LEAVE_TYPE_LABELS] ?? leaveType}: ${startDate.slice(0, 10)} – ${endDate.slice(0, 10)}`,
  };
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

function getWorstDayCoverage(
  workers: Worker[],
  year: number,
  month: number,
): { present: number; total: number } {
  const total = workers.length;
  if (total === 0) return { present: total, total };
  const daysInMonth = getDaysInMonth(year, month);
  let maxAbsent = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    let absent = 0;
    for (const worker of workers) {
      for (const leave of worker.leaves) {
        const start = toDate(leave.startDate);
        const end = toDate(leave.endDate);
        if (date >= start && date <= end) {
          absent++;
          break;
        }
      }
    }
    if (absent > maxAbsent) maxAbsent = absent;
  }
  return { present: total - maxAbsent, total };
}

// ── Main component ───────────────────────────────────────────────────────────

export function AbsenceTimeline({ workers, saving: _saving, onRequestAddLeave }: Props) {
  const [offset, setOffset] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = getMonthRange(offset);
  const hasLeaves = workers.some((w) => w.leaves.length > 0);

  const navLabel = (() => {
    const first = months[0];
    const last = months[months.length - 1];
    if (!first || !last) return '';
    const firstShort = MONTH_NAMES_SHORT[first.month] ?? '';
    const lastShort = MONTH_NAMES_SHORT[last.month] ?? '';
    return `${firstShort}–${lastShort} ${first.year}`;
  })();

  return (
    <>
      {/* Gantt panel */}
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <Heading variant="subsection" as="h3">
            Nieobecności
          </Heading>
          {/* Month navigation */}
          <div className={styles.tlNav}>
            <button
              type="button"
              className={styles.tlNavBtn}
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              disabled={offset === 0}
              title="Poprzednie miesiące"
            >
              <IconChevronLeft width="12" height="12" />
            </button>
            <Text variant="nano" as="span" mono color="muted">
              {navLabel}
            </Text>
            <button
              type="button"
              className={styles.tlNavBtn}
              onClick={() => setOffset((o) => o + 1)}
              title="Następne miesiące"
            >
              <IconChevronRight width="12" height="12" />
            </button>
          </div>
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
              <div />
            </div>

            {/* Worker rows */}
            {workers.map((worker) => (
              <div key={worker.id} className={styles.timelineRow}>
                <div className={styles.tlName}>
                  <Text variant="nano" weight="bold" color="secondary" as="span">
                    {getFirstNameInitial(worker.name)}
                  </Text>
                </div>
                {months.map(({ year, month }) => {
                  const isCurrentMonth =
                    offset === 0 && year === today.getFullYear() && month === today.getMonth();

                  const segments: BarSegment[] = [];
                  for (const leave of worker.leaves) {
                    const seg = getBarForMonth(
                      leave.startDate,
                      leave.endDate,
                      leave.type,
                      year,
                      month,
                    );
                    if (seg) segments.push(seg);
                  }

                  return (
                    <div key={`${year}-${month}`} className={styles.tlCell}>
                      {isCurrentMonth && (
                        <div
                          className={styles.todayLine}
                          style={{
                            left: `${((today.getDate() - 1) / getDaysInMonth(year, month)) * 100}%`,
                          }}
                        />
                      )}
                      {segments.length === 0 ? (
                        <div className={styles.tlEmpty}>
                          <Text
                            variant="nano"
                            mono
                            as="span"
                            style={{ color: 'var(--border-strong)' }}
                          >
                            ·
                          </Text>
                        </div>
                      ) : (
                        segments.map((seg, i) => (
                          <div
                            key={i}
                            className={`${styles.tlBar} ${
                              seg.isSoon ? styles.tlBarDashed : styles.tlBarSolid
                            }`}
                            style={{
                              left: `${seg.left}%`,
                              width: `${seg.width}%`,
                              background: seg.color,
                              borderColor: seg.isSoon ? seg.color : undefined,
                            }}
                            title={seg.title}
                          />
                        ))
                      )}
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
              </div>
            ))}

            {/* Coverage row */}
            <div className={styles.coverageRow}>
              <div className={styles.tlName}>
                <Text variant="nano" weight="bold" color="muted" as="span">
                  Obsada
                </Text>
              </div>
              {months.map(({ year, month }) => {
                const { present, total } = getWorstDayCoverage(workers, year, month);
                const ratio = total > 0 ? present / total : 1;
                const color =
                  ratio >= 0.75
                    ? 'var(--success)'
                    : ratio >= 0.5
                      ? 'var(--warning)'
                      : 'var(--danger)';
                return (
                  <div key={`${year}-${month}`} className={styles.coverageCell}>
                    <Text variant="nano" mono weight="bold" as="span" style={{ color }}>
                      {present}/{total}
                    </Text>
                  </div>
                );
              })}
              <div />
            </div>
          </div>
        )}

        {/* Legend */}
        <div className={styles.timelineLegend}>
          {(
            [
              ['VACATION', 'Urlop'],
              ['SICK', 'Chorobowe'],
              ['UNPAID', 'Bezpłatny'],
              ['OTHER', 'Inna'],
            ] as const
          ).map(([type, label]) => (
            <div key={type} className={styles.tlLegendItem}>
              <div className={styles.tlLegendDot} style={{ background: LEAVE_TYPE_COLORS[type] }} />
              <Text variant="nano" mono color="muted" as="span">
                {label}
              </Text>
            </div>
          ))}
        </div>

        <div className={styles.infoNote}>
          <IconInfo width="12" height="12" className={styles.infoNoteIcon} />
          <Text variant="nano" as="span" color="muted">
            W oknie nieobecności slot engine nie przydziela tego pracownika do stanowiska. Jeśli
            stanowisko nie ma innego pracownika — sloty blokowane automatycznie.
          </Text>
        </div>
      </div>
    </>
  );
}
