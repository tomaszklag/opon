import React from 'react';
import styles from './VerifiedBadge.module.css';

export interface VerifiedBadgeProps {
  label?: string;
  className?: string;
}

export function VerifiedBadge({ label = 'Zweryfikowany', className }: VerifiedBadgeProps) {
  return (
    <span className={[styles.badge, className].filter(Boolean).join(' ')}>
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 12 5 5L20 7" />
      </svg>
      {label}
    </span>
  );
}
