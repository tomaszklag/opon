import React from 'react';
import styles from './HoursTable.module.css';

export interface HoursRow {
  day: string;
  hours: string | null;
  isToday?: boolean;
}

export interface HoursTableProps {
  rows: HoursRow[];
  openLabel?: string;
  closedLabel?: string;
  className?: string;
}

export function HoursTable({ rows, openLabel, closedLabel, className }: HoursTableProps) {
  const todayRow = rows.find((r) => r.isToday);
  const isOpenNow = todayRow ? todayRow.hours !== null : null;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {isOpenNow !== null && (
        <span className={[styles.statusBadge, isOpenNow ? styles.open : styles.closed].join(' ')}>
          {isOpenNow ? (openLabel ?? 'Otwarte teraz') : (closedLabel ?? 'Zamknięte')}
        </span>
      )}
      <div className={styles.table}>
        {rows.map((row) => (
          <div
            key={row.day}
            className={[
              styles.row,
              row.isToday ? styles.today : null,
              !row.hours ? styles.closedRow : null,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={styles.day}>
              {row.day}
              {row.isToday && <span className={styles.todayTag}>Dziś</span>}
            </span>
            <span className={styles.hours}>{row.hours ?? 'Zamknięte'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
