'use client';
import React from 'react';
import { FieldLabel } from '../FieldLabel/FieldLabel';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, success, id, className, required, prefix, suffix, ...props },
  ref,
) {
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;

  const inputEl = (
    <input
      ref={ref}
      id={inputId}
      className={[
        styles.input,
        error ? styles.error : null,
        success && !error ? styles.success : null,
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
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
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
});

Input.displayName = 'Input';
