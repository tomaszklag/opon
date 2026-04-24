'use client';
import React from 'react';
import styles from './PhoneInput.module.css';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hint?: string;
  error?: string;
  countryCode?: string;
  className?: string;
}

export function PhoneInput({
  label,
  hint,
  error,
  countryCode = '+48',
  className,
  id,
  ...props
}: PhoneInputProps) {
  const inputId = id ?? 'phone-input';
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={[styles.wrapper, error ? styles.hasError : null].filter(Boolean).join(' ')}>
        <span className={styles.prefix} aria-hidden="true">
          <span className={styles.flag}>
            <span className={styles.flagTop} />
            <span className={styles.flagBottom} />
          </span>
          {countryCode}
        </span>
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          className={styles.input}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hint || error ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {(hint || error) && (
        <span id={`${inputId}-hint`} className={error ? styles.errorText : styles.hint}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
}
