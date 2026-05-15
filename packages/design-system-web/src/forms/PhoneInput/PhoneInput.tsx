'use client';
import React, { useRef } from 'react';
import { FieldLabel } from '../FieldLabel/FieldLabel';
import { Input } from '../Input/Input';
import styles from './PhoneInput.module.css';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hint?: string;
  error?: string;
  /** Shows green "Numer rozpoznany · {name}" helper row */
  recognizedName?: string;
  /** Shows amber "Nie mamy takiego numeru" pill with register link */
  notRegistered?: boolean;
  countryCode?: string;
  /** Fuses prefix and input into a single control — no gap */
  compact?: boolean;
  /** Shows a spinner inside the compact input (e.g. while searching clients) */
  loading?: boolean;
  className?: string;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
}

function formattedCursor(rawCursor: number): number {
  if (rawCursor > 6) return rawCursor + 2;
  if (rawCursor > 3) return rawCursor + 1;
  return rawCursor;
}

export function PhoneInput({
  label,
  hint,
  error,
  recognizedName,
  notRegistered = false,
  countryCode = '+48',
  compact = false,
  loading = false,
  className,
  id,
  required,
  value,
  onChange,
  ...props
}: PhoneInputProps) {
  const inputId = id ?? 'phone-input';
  const inputRef = useRef<HTMLInputElement>(null);

  const rawDigits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 9);
  const displayValue = formatPhone(rawDigits);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);

    // raw cursor position before spaces are counted
    const cursorInDisplay = e.target.selectionStart ?? e.target.value.length;
    const spacesBefore = (e.target.value.slice(0, cursorInDisplay).match(/ /g) ?? []).length;
    const rawCursor = Math.min(cursorInDisplay - spacesBefore, raw.length);

    onChange?.({ ...e, target: { ...e.target, value: raw } });

    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const pos = Math.min(formattedCursor(rawCursor), formatPhone(raw).length);
      el.setSelectionRange(pos, pos);
    });
  }

  const prefixBox = (
    <div className={styles.prefixBox} aria-hidden="true">
      <span className={styles.flag}>
        <span className={styles.flagTop} />
        <span className={styles.flagBottom} />
      </span>
      <span className={styles.prefixCode}>{countryCode}</span>
    </div>
  );

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}

      {compact ? (
        <div className={styles.phoneGridCompact}>
          {prefixBox}
          <input
            ref={inputRef}
            id={inputId}
            type="tel"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            required={required}
            className={styles.compactInput}
            {...props}
          />
          {loading && <span className={styles.compactSpinner} aria-hidden="true" />}
        </div>
      ) : (
        <div className={styles.phoneGrid}>
          {prefixBox}
          <Input
            ref={inputRef}
            id={inputId}
            type="tel"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            error={error}
            required={required}
            {...props}
          />
        </div>
      )}

      {hint && !error && !recognizedName && <p className={styles.hint}>{hint}</p>}

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

      {!error && !recognizedName && notRegistered && (
        <div className={styles.notRegisteredRow}>
          Nie mamy takiego numeru —{' '}
          <a href="/register" className={styles.notRegisteredLink}>
            Załóż warsztat
          </a>
        </div>
      )}
    </div>
  );
}
