'use client';
import React from 'react';
import styles from './Chip.module.css';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Chip({
  label,
  selected = false,
  onSelect,
  onRemove,
  disabled = false,
  className,
}: ChipProps) {
  const isInteractive = Boolean(onSelect);

  return (
    <span
      className={[
        styles.chip,
        selected ? styles.selected : null,
        isInteractive ? styles.interactive : null,
        disabled ? styles.disabled : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={isInteractive && !disabled ? onSelect : undefined}
      onKeyDown={
        isInteractive && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
    >
      {label}
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label}`}
          disabled={disabled}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M9 3L3 9M3 3l6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
