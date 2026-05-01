import React from 'react';
import styles from './KPICard.module.css';

export interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({ label, value, sub, accent = false, icon, className }: KPICardProps) {
  return (
    <div
      className={[styles.card, accent ? styles.accent : null, className].filter(Boolean).join(' ')}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}
