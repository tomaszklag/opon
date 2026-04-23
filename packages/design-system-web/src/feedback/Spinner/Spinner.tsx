import React from 'react';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className, label = 'Ładowanie…' }: SpinnerProps) {
  const cls = [styles.spinner, styles[size], className].filter(Boolean).join(' ');
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" aria-label={label} role="status">
      <circle cx="12" cy="12" r="9" stroke="var(--border-strong)" strokeWidth="2.5" />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="56.5"
        strokeDashoffset="42"
      />
    </svg>
  );
}
