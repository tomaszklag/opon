'use client';
import React, { useRef, useState, useCallback } from 'react';
import styles from './OTPInput.module.css';

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
  autoFocus = false,
}: OTPInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const controlled = value !== undefined;
  const otp = controlled ? value : internalValue;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateValue = useCallback(
    (next: string) => {
      if (!controlled) setInternalValue(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = otp.split('');
      if (chars[index]) {
        chars[index] = '';
        updateValue(chars.join(''));
      } else if (index > 0) {
        const prev = inputRefs.current[index - 1];
        prev?.focus();
        const c = otp.split('');
        c[index - 1] = '';
        updateValue(c.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const chars = otp.split('');
    // paste support: fill from current index
    const digits = raw.slice(0, length - index);
    digits.split('').forEach((d, i) => {
      chars[index + i] = d;
    });
    const next = chars.join('').slice(0, length);
    updateValue(next.padEnd(length, '').trimEnd());
    const nextFocus = Math.min(index + digits.length, length - 1);
    inputRefs.current[nextFocus]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    updateValue(pasted.padEnd(length, '').trimEnd());
    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  return (
    <div className={styles.root} role="group" aria-label="One-time password">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={otp[i] ?? ''}
          onChange={(e) => handleInput(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          className={[styles.cell, otp[i] ? styles.filled : null, error ? styles.error : null]
            .filter(Boolean)
            .join(' ')}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
