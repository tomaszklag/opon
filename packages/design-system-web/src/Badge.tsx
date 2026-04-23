import React from 'react';
import styles from './Badge.module.css';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Oczekuje',
  CONFIRMED: 'Potwierdzona',
  COMPLETED: 'Zrealizowana',
  CANCELLED: 'Anulowana',
  NO_SHOW: 'Nieobecność',
};

export interface BadgeProps {
  status: BookingStatus;
  label?: string;
  className?: string;
}

export function Badge({ status, label, className }: BadgeProps) {
  const cls = [styles.badge, styles[status.toLowerCase()], className].filter(Boolean).join(' ');
  return (
    <span className={cls} aria-label={`Status: ${label ?? STATUS_LABELS[status]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}
