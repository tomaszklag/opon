'use client';
import React, { useEffect, useRef } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  indeterminate?: boolean;
}

export function Checkbox({
  label,
  error,
  indeterminate,
  id,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  const checkId =
    id ?? (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={[styles.wrapper, disabled ? styles.disabled : null].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={checkId}>
        <input
          ref={inputRef}
          id={checkId}
          type="checkbox"
          className={styles.input}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        <span className={[styles.box, className].filter(Boolean).join(' ')} aria-hidden="true">
          <svg className={styles.check} viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path
              d="M1 5l3.5 3.5L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg className={styles.dash} viewBox="0 0 12 2" fill="none" aria-hidden="true">
            <path d="M1 1h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        {label && <span className={styles.labelText}>{label}</span>}
      </label>
      {error && (
        <p className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
