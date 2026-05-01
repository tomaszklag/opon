'use client';
import React from 'react';
import styles from './SettingsRow.module.css';

export interface SettingsRowProps {
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  trailing?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SettingsRow({
  icon,
  label,
  sub,
  trailing,
  danger = false,
  onClick,
  className,
}: SettingsRowProps) {
  const cls = [styles.row, danger ? styles.danger : null, className].filter(Boolean).join(' ');

  const arrow = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );

  return (
    <button type="button" className={cls} onClick={onClick}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.textCol}>
        <span className={styles.label}>{label}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </span>
      <span className={styles.trailing} aria-hidden="true">
        {trailing ?? arrow}
      </span>
    </button>
  );
}
