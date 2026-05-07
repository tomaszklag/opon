'use client';

import React, { useRef, useState } from 'react';
import styles from './TimeInput.module.css';

export interface TimeInputProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

export function TimeInput({
  value,
  onChange,
  label,
  error,
  disabled,
  'aria-label': ariaLabel,
}: TimeInputProps) {
  const parts = (value || '00:00').split(':');
  const hhVal = (parts[0] ?? '00').padStart(2, '0');
  const mmVal = (parts[1] ?? '00').padStart(2, '0');
  const curH = parseInt(hhVal, 10);
  const curM = parseInt(mmVal, 10);

  const [focused, setFocused] = useState<'hh' | 'mm' | null>(null);
  const [pending, setPending] = useState('');

  const hhRef = useRef<HTMLSpanElement>(null);
  const mmRef = useRef<HTMLSpanElement>(null);

  function emitHH(h: number) {
    onChange(`${String(Math.max(0, Math.min(23, h))).padStart(2, '0')}:${mmVal}`);
  }

  function emitMM(m: number) {
    onChange(`${hhVal}:${String(Math.max(0, Math.min(59, m))).padStart(2, '0')}`);
  }

  function focusMM() {
    setPending('');
    mmRef.current?.focus();
  }

  function focusHH() {
    setPending('');
    hhRef.current?.focus();
  }

  function handleDigit(d: number, seg: 'hh' | 'mm') {
    const max = seg === 'hh' ? 23 : 59;
    const emit = seg === 'hh' ? emitHH : emitMM;
    // digit that can't start a valid 2-digit value → single digit, advance
    const earlyAdvance = seg === 'hh' ? d >= 3 : d >= 6;

    if (pending === '') {
      if (earlyAdvance) {
        emit(d);
        if (seg === 'hh') focusMM();
      } else {
        setPending(String(d));
        emit(d); // show tentative value
      }
    } else {
      const full = parseInt(pending + d, 10);
      setPending('');
      emit(full <= max ? full : d);
      if (seg === 'hh') focusMM();
    }
  }

  function handleHhKey(e: React.KeyboardEvent) {
    if (disabled) return;
    // Let Tab propagate naturally for focus management
    if (e.key === 'Tab') {
      setPending('');
      return;
    }
    e.preventDefault();
    if (e.key === 'ArrowUp') {
      emitHH((curH + 1) % 24);
      setPending('');
    } else if (e.key === 'ArrowDown') {
      emitHH((curH - 1 + 24) % 24);
      setPending('');
    } else if (e.key === 'ArrowRight') {
      focusMM();
    } else if (/^\d$/.test(e.key)) {
      handleDigit(parseInt(e.key, 10), 'hh');
    }
  }

  function handleMmKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Tab') {
      setPending('');
      return;
    }
    e.preventDefault();
    if (e.key === 'ArrowUp') {
      emitMM((curM + 1) % 60);
      setPending('');
    } else if (e.key === 'ArrowDown') {
      emitMM((curM - 1 + 60) % 60);
      setPending('');
    } else if (e.key === 'ArrowLeft') {
      focusHH();
    } else if (/^\d$/.test(e.key)) {
      handleDigit(parseInt(e.key, 10), 'mm');
    }
  }

  return (
    <div
      className={[
        styles.wrap,
        focused ? styles.wrapFocused : '',
        error ? styles.wrapError : '',
        disabled ? styles.wrapDisabled : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          hhRef.current?.focus();
        }
      }}
    >
      {label && <span className={styles.label}>{label}</span>}

      <span
        ref={hhRef}
        role="spinbutton"
        aria-label="Godziny"
        aria-valuenow={curH}
        aria-valuemin={0}
        aria-valuemax={23}
        tabIndex={disabled ? -1 : 0}
        className={[styles.seg, focused === 'hh' ? styles.segFocused : '']
          .filter(Boolean)
          .join(' ')}
        onFocus={() => {
          setFocused('hh');
          setPending('');
        }}
        onBlur={() => {
          setFocused(null);
          setPending('');
        }}
        onKeyDown={handleHhKey}
      >
        {hhVal}
      </span>

      <span className={styles.colon} aria-hidden="true">
        :
      </span>

      <span
        ref={mmRef}
        role="spinbutton"
        aria-label="Minuty"
        aria-valuenow={curM}
        aria-valuemin={0}
        aria-valuemax={59}
        tabIndex={disabled ? -1 : 0}
        className={[styles.seg, focused === 'mm' ? styles.segFocused : '']
          .filter(Boolean)
          .join(' ')}
        onFocus={() => {
          setFocused('mm');
          setPending('');
        }}
        onBlur={() => {
          setFocused(null);
          setPending('');
        }}
        onKeyDown={handleMmKey}
      >
        {mmVal}
      </span>
    </div>
  );
}
