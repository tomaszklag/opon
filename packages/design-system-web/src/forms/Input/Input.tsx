'use client';
import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  id,
  className,
  required,
  prefix,
  suffix,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;

  const inputEl = (
    <input
      id={inputId}
      className={[
        styles.input,
        error ? styles.error : null,
        prefix ? styles.hasPrefix : null,
        suffix ? styles.hasSuffix : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
      required={required}
      {...props}
    />
  );

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {prefix || suffix ? (
        <div className={styles.inputWrap}>
          {prefix && (
            <span className={styles.prefix} aria-hidden="true">
              {prefix}
            </span>
          )}
          {inputEl}
          {suffix && (
            <span className={styles.suffix} aria-hidden="true">
              {suffix}
            </span>
          )}
        </div>
      ) : (
        inputEl
      )}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
