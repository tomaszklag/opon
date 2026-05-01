'use client';
import React from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  error?: boolean;
}

export function Toggle({
  label,
  description,
  size = 'md',
  error,
  id,
  disabled,
  className,
  ...props
}: ToggleProps) {
  const toggleId = id ?? (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={[styles.wrapper, disabled ? styles.disabled : null].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={toggleId}>
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          className={styles.input}
          disabled={disabled}
          {...props}
        />
        <span
          className={[styles.track, styles[size], error ? styles.error : null, className]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          <span className={styles.dot} />
        </span>
        {(label || description) && (
          <span className={styles.content}>
            {label && <span className={styles.labelText}>{label}</span>}
            {description && <span className={styles.description}>{description}</span>}
          </span>
        )}
      </label>
    </div>
  );
}
