'use client';
import React from 'react';
import styles from './PhoneInput.module.css';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  /** Short text shown to the right of the label, e.g. "Ten sam, co przy rejestracji" */
  hint?: string;
  error?: string;
  /** When set, shows the "Numer rozpoznany · {recognizedName}" helper row */
  recognizedName?: string;
  countryCode?: string;
  className?: string;
}

export function PhoneInput({
  label,
  hint,
  error,
  recognizedName,
  countryCode = '+48',
  className,
  id,
  ...props
}: PhoneInputProps) {
  const inputId = id ?? 'phone-input';
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {(label || hint) && (
        <div className={styles.labelRow}>
          {label && (
            <label className={styles.label} htmlFor={inputId}>
              {label}
            </label>
          )}
          {hint && <span className={styles.labelHint}>{hint}</span>}
        </div>
      )}

      <div className={styles.phoneGrid}>
        <div className={styles.prefixBox} aria-hidden="true">
          <span className={styles.flag}>
            <span className={styles.flagTop} />
            <span className={styles.flagBottom} />
          </span>
          <span className={styles.prefixCode}>{countryCode}</span>
        </div>
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          className={[styles.input, error ? styles.inputError : null].filter(Boolean).join(' ')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>

      {error && (
        <span id={`${inputId}-error`} className={styles.errorText} role="alert">
          {error}
        </span>
      )}

      {!error && recognizedName && (
        <div className={styles.helperRow}>
          <span className={styles.checkIco} aria-hidden="true">
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          Numer rozpoznany · {recognizedName}
        </div>
      )}
    </div>
  );
}
