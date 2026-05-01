import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && (
            <span className={styles.value} aria-hidden="true">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className={[styles.track, styles[size]].join(' ')}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}%`}
      >
        <div className={styles.fill} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
