import React from 'react';
import styles from './EmptyState.module.css';

export type EmptyStateIllustration = 'calendar' | 'search' | 'tire' | 'done' | 'warning';

export interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  illustration?: EmptyStateIllustration;
}

const ILLUSTRATIONS: Record<EmptyStateIllustration, React.ReactNode> = {
  calendar: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect
        x="8"
        y="12"
        width="48"
        height="44"
        rx="5"
        stroke="var(--border-strong)"
        strokeWidth="2.5"
      />
      <path d="M8 24h48" stroke="var(--border-strong)" strokeWidth="2.5" />
      <path d="M22 6v12M42 6v12" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <rect
        x="20"
        y="32"
        width="8"
        height="8"
        rx="2"
        fill="var(--accent-muted)"
        stroke="var(--accent-border)"
        strokeWidth="1.5"
      />
      <rect
        x="36"
        y="32"
        width="8"
        height="8"
        rx="2"
        fill="var(--surface-hover)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <rect
        x="20"
        y="44"
        width="8"
        height="8"
        rx="2"
        fill="var(--surface-hover)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
    </svg>
  ),
  search: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="18" stroke="var(--border-strong)" strokeWidth="2.5" />
      <path d="M42 42L56 56" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 28h16M28 20v16" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  tire: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="24" stroke="var(--border-strong)" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="12" stroke="var(--accent)" strokeWidth="2.5" />
      <path
        d="M32 8v10M32 46v10M8 32h10M46 32h10"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  done: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke="var(--success)"
        strokeWidth="2.5"
        strokeOpacity="0.4"
      />
      <circle cx="32" cy="32" r="16" fill="rgba(46, 224, 160, 0.1)" />
      <path
        d="M20 32l9 9 15-16"
        stroke="var(--success)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  warning: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="24" stroke="var(--border-strong)" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="12" stroke="var(--border-strong)" strokeWidth="2" />
      <path
        d="M26 22 Q32 16 38 22 Q30 28 28 36"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 8v10M32 46v10M8 32h10M46 32h10"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="32"
        cy="32"
        r="7"
        fill="var(--warning-muted)"
        stroke="var(--warning)"
        strokeWidth="1.5"
      />
      <path d="M32 28v5" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="36.5" r="1" fill="var(--warning)" />
    </svg>
  ),
};

export function EmptyState({
  title,
  description,
  ctaLabel,
  onCtaClick,
  illustration = 'calendar',
}: EmptyStateProps) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.illustration}>{ILLUSTRATIONS[illustration]}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {ctaLabel && onCtaClick && (
        <button className={styles.cta} onClick={onCtaClick} type="button">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
