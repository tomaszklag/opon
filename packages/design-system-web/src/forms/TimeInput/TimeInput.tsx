'use client';
import React, { useEffect, useRef, useState } from 'react';
import styles from './TimeInput.module.css';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  );
}

export interface TimeInputProps {
  value: string;
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
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  const [hh, mm] = value ? value.split(':') : ['', ''];
  const selectedH = hh ?? '';
  const selectedM = mm ? String(Math.round(parseInt(mm) / 5) * 5).padStart(2, '0') : '';

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Scroll selected options into view
    const scrollTo = (
      ref: React.RefObject<HTMLDivElement | null>,
      val: string,
      items: string[],
    ) => {
      const el = ref.current;
      if (!el) return;
      const idx = items.indexOf(val);
      if (idx < 0) return;
      // Each option ~27px, colLabel ~24px
      el.scrollTop = idx * 27;
    };
    requestAnimationFrame(() => {
      scrollTo(hourRef, selectedH, HOURS);
      scrollTo(minRef, selectedM, MINUTES);
    });
  }, [open, selectedH, selectedM]);

  function select(h: string, m: string) {
    onChange(`${h}:${m}`);
  }

  function toggle() {
    if (!disabled) setOpen((v) => !v);
  }

  return (
    <div
      ref={wrapRef}
      className={[
        styles.wrap,
        open ? styles.wrapOpen : '',
        error ? styles.wrapError : '',
        disabled ? styles.wrapDisabled : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label && <span className={styles.label}>{label}</span>}

      <span
        className={[styles.display, !value ? styles.displayEmpty : ''].filter(Boolean).join(' ')}
        onClick={toggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel ?? label ?? 'Wybierz godzinę'}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        {value || '--:--'}
      </span>

      <button
        type="button"
        className={styles.iconBtn}
        onClick={toggle}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
      >
        <ClockIcon />
      </button>

      {open && (
        <div className={styles.popover} role="dialog" aria-label="Wybór godziny">
          {/* Hours */}
          <div className={styles.col} ref={hourRef}>
            <div className={styles.colLabel}>godz.</div>
            {HOURS.map((h) => (
              <div
                key={h}
                className={[styles.option, h === selectedH ? styles.optionSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(h, selectedM || '00');
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Minutes */}
          <div className={styles.col} ref={minRef}>
            <div className={styles.colLabel}>min.</div>
            {MINUTES.map((m) => (
              <div
                key={m}
                className={[styles.option, m === selectedM ? styles.optionSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(selectedH || '08', m);
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
